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

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="DSBDA Data Analysis API",
    description="Backend for natural language data analysis with LLM",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Global state (in production, use a database)
datasets: Dict[str, Dict[str, Any]] = {}

# ============= Data Models =============

class ChatRequest(BaseModel):
    message: str
    dataset_id: str
    history: Optional[List[Dict[str, str]]] = []

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

async def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Call Ollama API with Mistral model"""
    url = f"{get_ollama_url()}/api/generate"
    
    payload = {
        "model": "mistral",
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
    except Exception as e:
        logger.error(f"Error calling Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")

def load_dataframe(dataset_id: str) -> pd.DataFrame:
    """Load dataset as pandas DataFrame"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets[dataset_id]
    file_path = dataset["file_path"]
    
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    elif file_path.endswith((".xlsx", ".xls")):
        return pd.read_excel(file_path)
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
        "ollama_url": get_ollama_url()
    }

@app.post("/api/datasets/upload", response_model=DatasetInfo)
async def upload_dataset(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload a CSV or XLSX file"""
    # Validate file type
    allowed_extensions = [".csv", ".xlsx", ".xls"]
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {allowed_extensions}"
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
    except Exception as e:
        # Clean up file
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Store dataset info
    dataset_info = {
        "id": dataset_id,
        "name": file.filename,
        "file_path": str(file_path),
        "rows": len(df),
        "columns": len(df.columns),
        "columns_info": get_columns_info(df),
        "created_at": datetime.now().isoformat()
    }
    
    datasets[dataset_id] = dataset_info
    
    return DatasetInfo(**dataset_info)

@app.get("/api/datasets", response_model=List[DatasetInfo])
async def list_datasets():
    """List all uploaded datasets"""
    return [DatasetInfo(**ds) for ds in datasets.values()]

@app.get("/api/datasets/{dataset_id}", response_model=DatasetInfo)
async def get_dataset(dataset_id: str):
    """Get dataset information"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetInfo(**datasets[dataset_id])

@app.get("/api/datasets/{dataset_id}/data")
async def get_dataset_data(
    dataset_id: str, 
    limit: int = 100, 
    offset: int = 0,
    filters: Optional[str] = None
):
    """Get dataset data with optional pagination and filters"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = load_dataframe(dataset_id)
        
        # Apply filters if provided
        if filters:
            filter_dict = json.loads(filters)
            for col, value in filter_dict.items():
                if col in df.columns:
                    df = df[df[col] == value]
        
        # Apply pagination
        total = len(df)
        df_page = df.iloc[offset:offset + limit]
        
        return {
            "data": df_page.to_dict(orient="records"),
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filter format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets/{dataset_id}/summary")
async def get_dataset_summary(dataset_id: str):
    """Get dataset summary with statistics"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = load_dataframe(dataset_id)
        return generate_dataset_summary(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a chat message and get LLM response with data analysis"""
    
    # Validate dataset exists
    if request.dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = load_dataframe(request.dataset_id)
        dataset_info = datasets[request.dataset_id]
        
        # Get column information
        columns_info = dataset_info["columns_info"]
        columns_str = ", ".join([f"{c['name']} ({c['type']})" for c in columns_info])
        
        # Get sample data (first 20 rows)
        sample_data = df.head(20).to_csv(index=False)
        
        # Build the prompt
        system_prompt = """You are a data analysis assistant. Your task is to:
1. Understand the user's question about the data
2. Analyze the data to find the answer
3. If asked to create a chart, return a valid Vega-Lite chart specification
4. Always provide accurate analysis based on the data

When responding:
- Be concise but informative
- If providing data, include the actual numbers
- If asked for charts, return a valid JSON Vega-Lite specification
- Format your response clearly
        
Available chart types for Vega-Lite:
- bar, line, area, scatter, pie, histogram
- You can specify: mark type, encoding (x, y, color, etc.), titles
        
Return your response as a JSON object with these fields:
{
    "response": "Your text response",
    "chart_spec": { (optional) Vega-Lite spec },
    "data": [ (optional) data records for display ]
}"""

        # Generate summary statistics for context
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        cat_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        context = f"""Dataset: {dataset_info['name']}
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
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets[dataset_id]
    file_path = Path(dataset["file_path"])
    
    if file_path.exists():
        file_path.unlink()
    
    del datasets[dataset_id]
    
    return {"message": "Dataset deleted successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    ollama_status = "unknown"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{get_ollama_url()}/api/tags")
            ollama_status = "connected" if response.status_code == 200 else "error"
    except:
        ollama_status = "disconnected"
    
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "datasets_count": len(datasets)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
