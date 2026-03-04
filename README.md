# DSBDA Data Analysis Assistant

A natural language data analysis tool that allows users to upload datasets and query them using plain English. The application uses an LLM (Mistral via Ollama) to understand user queries and perform data analysis.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │──────│   Backend       │──────│   Ollama        │
│   (React/Vite)  │      │   (FastAPI)     │      │   (Mistral)     │
│   Port 5173     │      │   Port 8000     │      │   Port 11434    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Project Structure

```
DSBDA_project/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   └── pages/
│   │       └── DataAnalysisAssistant.jsx   # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── backend/            # Python FastAPI backend
│   ├── main.py        # API endpoints & logic
│   ├── requirements.txt
│   └── README.md     # Backend-specific docs
│
└── README.md          # This file
```

## Features

- **File Upload**: Support for CSV and XLSX files
- **Natural Language Queries**: Ask questions in plain English
- **Data Analysis**: Statistical summaries and insights
- **Chart Support**: Vega-Lite chart specifications
- **Real-time Chat**: Interactive conversation with the LLM

## Prerequisites

1. **Node.js** (v18+) - For running the frontend
2. **Python 3.10+** - For running the backend
3. **Ollama** - For running the Mistral LLM

## Installation & Setup

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull the Mistral model (first time only)
ollama pull mistral
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Open your browser to `http://localhost:5173`
2. Upload a CSV or XLSX file using the sidebar or drag-and-drop
3. Select the uploaded dataset
4. Ask questions in plain English, for example:
   - "What are the column names?"
   - "Show me a summary of the data"
   - "What is the average of column X?"
   - "Create a bar chart of column Y"

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/datasets/upload` | POST | Upload a CSV/XLSX file |
| `/api/datasets` | GET | List all datasets |
| `/api/datasets/{id}` | GET | Get dataset information |
| `/api/datasets/{id}/data` | GET | Get paginated data |
| `/api/datasets/{id}/summary` | GET | Get statistical summary |
| `/api/chat` | POST | Send chat message to LLM |
| `/api/health` | GET | Health check |

## Environment Variables

### Backend (.env)

```bash
# Ollama URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434

# Server config
HOST=0.0.0.0
PORT=8000
```

## Troubleshooting

### Ollama not running
```
Error: Ollama is not running. Please start Ollama with 'ollama serve'
```
**Solution**: Run `ollama serve` in a terminal

### CORS errors
```
Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy
```
**Solution**: Ensure backend is running and CORS is configured to allow your frontend origin

### Model not found
```
Error: model 'mistral' not found
```
**Solution**: Run `ollama pull mistral` to download the model

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4
- **Backend**: Python, FastAPI, Pandas
- **LLM**: Ollama with Mistral model

## License

MIT
