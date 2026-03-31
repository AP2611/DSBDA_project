"""
DSBDA Backend - Data Analysis Assistant API
Uses Ollama with Mistral model for natural language data analysis
"""

import os
import json
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
import pandas as pd
import httpx
import logging
import pdfplumber
import json
import models
from database import engine, get_db
from auth_router import router as auth_router, get_current_user
from auth_utils import get_password_hash
from schemas import UserRegister, DatasetInfo as DatasetSchema, ChatRequest, ChatResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="DSBDA Data Analysis API",
    description="Backend for natural language data analysis with LLM",
    version="1.0.0"
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Configure CORS - Read from environment variable
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:80").split(",")
logger.info(f"Configuring CORS for origins: {CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication router
app.include_router(auth_router)

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB max file size
MAX_ROWS_IN_MEMORY = 100000  # Limit rows for in-memory processing

# Global state (in-memory cache, database is source of truth)
datasets_cache: Dict[str, Dict[str, Any]] = {}

# ============= Data Models =============

class ChatRequest(BaseModel):
    message: str
    dataset_id: str
    history: Optional[List[Dict[str, str]]] = []

    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        if len(v) > 5000:
            raise ValueError('Message too long (max 5000 characters)')
        return v.strip()

class ChatResponse(BaseModel):
    response: str
    chart_spec: Optional[Dict[str, Any]] = None
    data: Optional[List[Dict[str, Any]]] = None

class DatasetInfo(BaseModel):
    id: str
    name: str
    rows: int
    columns: int
    columns_info: List[Dict[str, str]]
    created_at: str

# ============= Helper Functions =============

def get_ollama_url() -> str:
    """Get Ollama API URL from environment or use default"""
    return os.getenv("OLLAMA_URL", "http://localhost:11434")

def get_ollama_model() -> str:
    """Get Ollama model name from environment or use default"""
    return os.getenv("OLLAMA_MODEL", "mistral")

async def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Call Ollama API with configured model"""
    url = f"{get_ollama_url()}/api/generate"
    
    payload = {
        "model": get_ollama_model(),
        "prompt": prompt,
        "system": system_prompt,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503, 
            detail="Ollama is not running. Please start Ollama with 'ollama serve'"
        )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Ollama timed out")
    except Exception as e:
        logger.error(f"Error calling Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")

def load_dataframe(dataset_id: str) -> pd.DataFrame:
    """Load dataset as pandas DataFrame"""
    if dataset_id not in datasets_cache:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets_cache[dataset_id]
    file_path = dataset["file_path"]
    
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    elif file_path.endswith((".xlsx", ".xls")):
        return pd.read_excel(file_path)
    elif file_path.endswith(".pdf"):
        # Extract tables from PDF using pdfplumber
        with pdfplumber.open(file_path) as pdf:
            all_tables = []
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if table and len(table) > 1:
                        all_tables.append(table)
            if not all_tables:
                raise HTTPException(status_code=400, detail="No tables found in PDF.")
            # Use the first table found
            df = pd.DataFrame(all_tables[0][1:], columns=all_tables[0][0])
            return df
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

def get_columns_info(df: pd.DataFrame) -> List[Dict[str, str]]:
    """Get information about DataFrame columns"""
    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        col_info = {"name": col, "type": dtype}
        
        # Add sample values for categorical columns
        if df[col].dtype == "object" or df[col].nunique() < 20:
            col_info["unique_values"] = df[col].unique().tolist()[:10]
        
        columns.append(col_info)
    
    return columns

def generate_dataset_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Generate a summary of the dataset"""
    summary = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": get_columns_info(df),
        "numeric_summary": {},
        "categorical_summary": {}
    }
    
    # Numeric columns summary
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        summary["numeric_summary"][col] = {
            "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
            "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
            "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
            "median": float(df[col].median()) if not pd.isna(df[col].median()) else None,
            "null_count": int(df[col].isna().sum())
        }
    
    # Categorical columns summary
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        summary["categorical_summary"][col] = {
            "unique_count": int(df[col].nunique()),
            "top_values": df[col].value_counts().head(5).to_dict(),
            "null_count": int(df[col].isna().sum())
        }
    
    return summary

# ============= API Endpoints =============

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DSBDA Data Analysis API",
        "version": "1.0.0",
        "ollama_url": get_ollama_url(),
        "ollama_model": get_ollama_model()
    }

@app.post("/api/datasets/upload", response_model=DatasetSchema)
async def upload_dataset(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a CSV, XLSX, or PDF file (requires authentication)"""
    # Validate file type
    allowed_extensions = [".csv", ".xlsx", ".xls", ".pdf"]
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {allowed_extensions}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique ID
    dataset_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{dataset_id}{file_ext}"
    
    # Save file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Load and validate data
    try:
        df = load_dataframe(dataset_id)
        
        # Check row limit
        if len(df) > MAX_ROWS_IN_MEMORY:
            # Clean up file
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=400,
                detail=f"Dataset too large. Maximum rows: {MAX_ROWS_IN_MEMORY}"
            )
            
    except pd.errors.EmptyDataError:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")
    except Exception as e:
        # Clean up file
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Store dataset in database
    columns_info = get_columns_info(df)
    dataset = models.Dataset(
        id=dataset_id,
        name=file.filename,
        file_path=str(file_path),
        original_filename=file.filename,
        rows=len(df),
        columns=len(df.columns),
        columns_info=json.dumps(columns_info),
        owner_id=current_user.id
    )
    
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    # Cache dataset info for quick access
    datasets_cache[dataset_id] = {
        "id": dataset.id,
        "name": dataset.name,
        "file_path": dataset.file_path,
        "rows": dataset.rows,
        "columns": dataset.columns,
        "columns_info": columns_info,
        "created_at": dataset.created_at.isoformat(),
        "owner_id": dataset.owner_id
    }
    
    return DatasetSchema(**{
        "id": dataset.id,
        "name": dataset.name,
        "rows": dataset.rows,
        "columns": dataset.columns,
        "columns_info": columns_info,
        "created_at": dataset.created_at,
        "owner_id": dataset.owner_id
    })

@app.get("/api/datasets", response_model=List[DatasetSchema])
async def list_datasets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all datasets owned by the current user"""
    user_datasets = db.query(models.Dataset).filter(
        models.Dataset.owner_id == current_user.id
    ).all()
    
    result = []
    for ds in user_datasets:
        columns_info = json.loads(ds.columns_info) if ds.columns_info else []
        result.append(DatasetSchema(
            id=ds.id,
            name=ds.name,
            rows=ds.rows,
            columns=ds.columns,
            columns_info=columns_info,
            created_at=ds.created_at,
            owner_id=ds.owner_id
        ))
    
    return result

@app.get("/api/datasets/{dataset_id}", response_model=DatasetSchema)
async def get_dataset(
    dataset_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dataset information (requires ownership)"""
    dataset = db.query(models.Dataset).filter(
        models.Dataset.id == dataset_id,
        models.Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    columns_info = json.loads(dataset.columns_info) if dataset.columns_info else []
    return DatasetSchema(
        id=dataset.id,
        name=dataset.name,
        rows=dataset.rows,
        columns=dataset.columns,
        columns_info=columns_info,
        created_at=dataset.created_at,
        owner_id=dataset.owner_id
    )

@app.get("/api/datasets/{dataset_id}/data")
async def get_dataset_data(
    dataset_id: str, 
    limit: int = 100, 
    offset: int = 0,
    filters: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dataset data with optional pagination and filters (requires ownership)"""
    dataset = db.query(models.Dataset).filter(
        models.Dataset.id == dataset_id,
        models.Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Validate pagination
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset must be non-negative")
    
    try:
        df = load_dataframe(dataset_id)
        
        # Apply filters if provided
        if filters:
            try:
                filter_dict = json.loads(filters)
                for col, value in filter_dict.items():
                    if col in df.columns:
                        df = df[df[col] == value]
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid filter format")
        
        # Apply pagination
        total = len(df)
        df_page = df.iloc[offset:offset + limit]
        
        return {
            "data": df_page.to_dict(orient="records"),
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting dataset data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets/{dataset_id}/summary")
async def get_dataset_summary(
    dataset_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dataset summary with statistics (requires ownership)"""
    dataset = db.query(models.Dataset).filter(
        models.Dataset.id == dataset_id,
        models.Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = load_dataframe(dataset_id)
        return generate_dataset_summary(df)
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a chat message and get LLM response with data analysis (requires ownership)"""
    
    # Validate dataset exists and user owns it
    dataset = db.query(models.Dataset).filter(
        models.Dataset.id == request.dataset_id,
        models.Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = load_dataframe(request.dataset_id)
        dataset_info_cached = datasets_cache.get(request.dataset_id, {})
        
        # Get column information
        columns_info = json.loads(dataset.columns_info) if dataset.columns_info else []
        columns_str = ", ".join([f"{c['name']} ({c['type']})" for c in columns_info])
        
        # Get sample data (first 20 rows)
        sample_data = df.head(20).to_csv(index=False)
        
        # Build the prompt with enhanced chart generation capabilities
        system_prompt = """You are an expert data analysis assistant specializing in visualization and statistical analysis.

Your core capabilities:
1. **Data Analysis**: Analyze datasets to find patterns, trends, correlations, and insights
2. **Chart Generation**: Create production-ready Vega-Lite specifications for various chart types
3. **Statistical Analysis**: Calculate means, medians, modes, correlations, distributions, etc.
4. **Data Transformation**: Aggregate, filter, group, and transform data as needed

## CHART GENERATION RULES:

When the user asks for any visualization (chart, graph, plot), you MUST return a valid Vega-Lite JSON specification.

### Available Chart Types and When to Use:

1. **Bar Chart** (`mark: "bar"`):
   - Categorical comparisons
   - Frequency distributions
   - Top-N rankings
   - Use when: comparing values across categories

2. **Line Chart** (`mark: "line"`):
   - Time series data
   - Trends over time
   - Continuous data
   - Use when: showing data changes over time or continuous variable

3. **Area Chart** (`mark: {"type": "area"}`):
   - Cumulative trends
   - Volume over time
   - Use when: emphasizing magnitude of change

4. **Scatter Plot** (`mark: "point"`):
   - Correlation between two numeric variables
   - Outlier detection
   - Use when: showing relationship between two numeric variables

5. **Pie/Donut Chart** (`mark: {"type": "pie"}` or `"donut"`):
   - Proportional distribution
   - Part-to-whole relationships
   - Use when: showing percentage breakdown (limit to 5-7 categories)

6. **Histogram** (`mark: "bar"` with binning):
   - Distribution of numeric data
   - Use when: showing frequency distributions

7. **Box Plot** (`mark: "boxplot"`):
   - Statistical distributions
   - Use when: showing quartiles and outliers

### Vega-Lite Specification Format:

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 300,
  "title": "Your Chart Title",
  "data": {
    "values": []
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "column_name", "type": "quantitative|ordinal|nominal|temporal", "title": "X Axis Label"},
    "y": {"field": "value_column", "type": "quantitative|ordinal", "title": "Y Axis Label"},
    "color": {"field": "category_column", "type": "nominal"},
    "tooltip": [{"field": "column1"}, {"field": "column2"}]
  }
}
```

### Chart Best Practices:
- Always set appropriate axis titles
- Use clear, descriptive titles
- Choose correct data types (quantitative for numbers, nominal for categories, temporal for dates)
- For pie charts: limit to top categories, group rest as "Other"
- For time series: use temporal type on x-axis
- Use tooltips for interactivity
- Use color schemes appropriately

## DATA ANALYSIS RULES:

1. Always calculate actual statistics from the data
2. Provide specific numbers and percentages
3. Identify trends and patterns
4. Note any outliers or anomalies
5. For correlations: interpret as strong/moderate/weak

## RESPONSE FORMAT:

You must return a JSON object with these fields:
{
    "response": "Your detailed text analysis with specific numbers and insights",
    "chart_spec": {},
    "data": []
}

IMPORTANT: Always respond in valid JSON format."""

        # Generate summary statistics for context
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        cat_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        context = f"""Dataset: {dataset.name}
Columns: {columns_str}

Numeric columns: {numeric_cols}
Categorical columns: {cat_cols}

Sample data (first 20 rows):
{sample_data}

User question: {request.message}"""

        # Call Ollama
        llm_response = await call_ollama(context, system_prompt)
        
        # Parse LLM response
        try:
            # Try to extract JSON from response
            response_text = llm_response.strip()
            
            # Handle responses that might have text before/after JSON
            if "{" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_str = response_text[start:end]
                parsed = json.loads(json_str)
                
                return ChatResponse(
                    response=parsed.get("response", llm_response),
                    chart_spec=parsed.get("chart_spec"),
                    data=parsed.get("data")
                )
            else:
                return ChatResponse(response=llm_response)
        except json.JSONDecodeError:
            # If not valid JSON, return as text
            return ChatResponse(response=llm_response)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a dataset (requires ownership)"""
    dataset = db.query(models.Dataset).filter(
        models.Dataset.id == dataset_id,
        models.Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    file_path = Path(dataset.file_path)
    
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    db.delete(dataset)
    db.commit()
    
    # Remove from cache
    if dataset_id in datasets_cache:
        del datasets_cache[dataset_id]
    
    return {"message": "Dataset deleted successfully"}

@app.get("/api/health")
async def health_check(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Health check endpoint (requires authentication)"""
    ollama_status = "unknown"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{get_ollama_url()}/api/tags")
            ollama_status = "connected" if response.status_code == 200 else "error"
    except:
        ollama_status = "disconnected"
    
    # Count user's datasets
    datasets_count = db.query(models.Dataset).filter(
        models.Dataset.owner_id == current_user.id
    ).count()
    
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "datasets_count": datasets_count,
        "user": current_user.username
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
