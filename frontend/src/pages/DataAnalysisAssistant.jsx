import { useState, useRef, useEffect } from "react";
import embed from "vega-embed";

const API_BASE = "http://localhost:8000/api";

const sparkles = "✨";

function GradientText({ children, className = "" }) {
  return (
    <span
      className={className}
      style={{
        background: "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%), hsl(45, 95%, 60%))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

function BoltIcon() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%), hsl(45, 95%, 60%))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
      </svg>
    </div>
  );
}

function SparkleIcon() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%), hsl(45, 95%, 60%))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l1.5 6H20l-5.25 3.75L16.5 18 12 14.25 7.5 18l1.75-6.25L4 8h6.5L12 2z" />
      </svg>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="hsl(280, 60%, 70%)" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(270, 20%, 50%)' }}>
      <div style={{
        width: 16,
        height: 16,
        border: '2px solid hsl(270, 20%, 80%)',
        borderTopColor: 'hsl(280, 80%, 60%)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span>Analyzing...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CrystalBallIllustration() {
  return (
    <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
      {/* Ball */}
      <div style={{
        width: 70,
        height: 70,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, hsl(270, 30%, 40%), hsl(260, 40%, 18%))",
        position: "relative",
        boxShadow: "0 8px 32px hsla(270, 60%, 20%, 0.5), inset 0 2px 8px hsla(280, 60%, 70%, 0.2)",
      }}>
        {/* Sparkles on ball */}
        <div style={{ position: "absolute", top: 14, right: 16, color: "hsl(45, 95%, 65%)", fontSize: 14 }}>✦</div>
        <div style={{ position: "absolute", top: 28, left: 12, color: "hsl(45, 95%, 65%)", fontSize: 10 }}>✦</div>
        <div style={{ position: "absolute", bottom: 20, right: 12, color: "hsl(280, 60%, 80%)", fontSize: 8 }}>✦</div>
      </div>
      {/* Base */}
      <div style={{
        width: 40,
        height: 10,
        background: "hsl(270, 20%, 25%)",
        borderRadius: 4,
        margin: "0 auto",
        marginTop: -2,
      }} />
    </div>
  );
}

// Message component for chat
function ChatMessage({ message, isUser }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: '4px',
    }}>
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '16px',
        background: isUser 
          ? 'linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%))'
          : 'white',
        color: isUser ? 'white' : 'hsl(270, 40%, 10%)',
        fontSize: 14,
        lineHeight: 1.5,
        boxShadow: isUser ? 'none' : '0 2px 8px hsla(270, 20%, 50%, 0.1)',
        border: isUser ? 'none' : '1px solid hsl(270, 20%, 90%)',
      }}>
        {message}
      </div>
    </div>
  );
}

// Chart component using Vega-Lite
function ChartDisplay({ chartSpec, data }) {
  const chartRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chartSpec || !chartRef.current) return;

    const renderChart = async () => {
      try {
        setError(null);
        // Merge the chart spec with data if provided
        const spec = chartSpec.data ? chartSpec : { ...chartSpec, data: { values: data } };
        
        await embed(chartRef.current, spec, {
          actions: false,
          renderer: 'svg',
          theme: 'light'
        });
      } catch (err) {
        console.error('Chart render error:', err);
        setError('Failed to render chart');
      }
    };

    renderChart();
  }, [chartSpec, data]);

  if (!chartSpec && !data) return null;
  
  // Render Vega-Lite chart
  if (chartSpec) {
    return (
      <div style={{
        marginTop: '12px',
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid hsl(270, 20%, 90%)',
      }}>
        <div ref={chartRef} style={{ width: '100%' }} />
        {error && (
          <div style={{ color: 'hsl(0, 70%, 50%)', fontSize: 13, marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>
    );
  }
  
  // Simple table display for data
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    return (
      <div style={{
        marginTop: '12px',
        overflowX: 'auto',
        borderRadius: '12px',
        border: '1px solid hsl(270, 20%, 90%)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  background: 'hsl(270, 20%, 95%)',
                  fontWeight: 600,
                  borderBottom: '1px solid hsl(270, 20%, 90%)',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col} style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid hsl(270, 20%, 95%)',
                  }}>
                    {row[col] !== null ? row[col].toString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <div style={{ padding: '8px', textAlign: 'center', color: 'hsl(270, 20%, 50%)', fontSize: 12 }}>
            Showing 10 of {data.length} rows
          </div>
        )}
      </div>
    );
  }
  
  return null;
}

export default function DataAnalysisAssistant() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Check API connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('API connected:', data);
        setConnectionError(null);
      }
    } catch (error) {
      console.error('API connection failed:', error);
      setConnectionError('Cannot connect to backend. Make sure the server is running on port 8000.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith(".csv") || f.name.endsWith(".xlsx")
    );
    if (files.length) {
      await uploadFiles(files);
    }
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setIsLoading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE}/datasets/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const datasetInfo = await response.json();
        setDatasets(prev => [...prev, datasetInfo]);
        if (!selectedDataset) {
          setSelectedDataset(datasetInfo);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading files: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedDataset || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          dataset_id: selectedDataset.id,
          history: messages.slice(-10) // Send last 10 messages for context
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response,
        chartSpec: result.chart_spec,
        data: result.data
      }]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100%",
      fontFamily: "'Space Grotesk', sans-serif",
      background: "hsl(270, 30%, 98%)",
      color: "hsl(270, 40%, 10%)",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 300,
        minWidth: 300,
        background: "linear-gradient(180deg, hsl(280, 60%, 97%), hsl(320, 40%, 97%))",
        borderRight: "1px solid hsl(270, 20%, 90%)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px",
        gap: 16,
      }}>
        {/* Sidebar Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }}>
          <BoltIcon />
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            background: "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Datasets
          </span>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'hsl(0, 70%, 95%)',
            color: 'hsl(0, 70%, 40%)',
            fontSize: 12,
          }}>
            {connectionError}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 50,
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            background: isLoading 
              ? "hsl(270, 20%, 85%)" 
              : "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%), hsl(45, 95%, 60%))",
            color: "white",
            fontWeight: 600,
            fontSize: 15,
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: isLoading ? "none" : "0 4px 16px hsla(280, 80%, 60%, 0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseOver={e => { 
            if (!isLoading) {
              e.currentTarget.style.transform = "translateY(-1px)"; 
              e.currentTarget.style.boxShadow = "0 6px 20px hsla(280, 80%, 60%, 0.45)"; 
            }
          }}
          onMouseOut={e => { 
            if (!isLoading) {
              e.currentTarget.style.transform = ""; 
              e.currentTarget.style.boxShadow = "0 4px 16px hsla(280, 80%, 60%, 0.35)"; 
            }
          }}
        >
          <UploadIcon />
          Upload Dataset
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" multiple style={{ display: "none" }} onChange={handleFileInput} />

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragOver ? "hsl(280, 80%, 60%)" : "hsl(280, 60%, 80%)"}`,
            borderRadius: 16,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            background: isDragOver ? "hsla(280, 80%, 60%, 0.05)" : "transparent",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileIcon />
          <span style={{ fontSize: 13, color: "hsl(270, 20%, 45%)", fontWeight: 500, textAlign: "center" }}>
            Drop CSV or XLSX here 📁
          </span>
        </div>

        {/* Dataset List or Empty */}
        {datasets.length === 0 ? (
          <div style={{ textAlign: "center", color: "hsl(270, 20%, 55%)", fontSize: 14, paddingTop: 8 }}>
            No datasets yet 🐣
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
            {datasets.map((ds, i) => (
              <div
                key={ds.id || i}
                onClick={() => setSelectedDataset(ds)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: selectedDataset?.id === ds.id
                    ? "hsla(280, 80%, 60%, 0.12)"
                    : "transparent",
                  border: selectedDataset?.id === ds.id
                    ? "1px solid hsla(280, 80%, 60%, 0.3)"
                    : "1px solid transparent",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "hsl(270, 30%, 25%)",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ds.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Top Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid hsl(270, 20%, 90%)",
          background: "hsl(270, 30%, 98%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SparkleIcon />
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              <GradientText>Data Analysis </GradientText>
              <span style={{ fontWeight: 600, color: "hsl(270, 40%, 10%)" }}>Assistant</span>
            </span>
          </div>

          {/* Model Selector */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 20,
            border: "1px solid hsl(270, 20%, 88%)",
            background: "white",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            color: "hsl(270, 30%, 30%)",
            boxShadow: "0 1px 4px hsla(270, 20%, 50%, 0.08)",
          }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "linear-gradient(135deg, hsl(200, 70%, 60%), hsl(230, 70%, 60%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 10 }}>⚡</span>
            </div>
            Mistral
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 24,
          gap: 16,
          overflowY: "auto",
          background: "hsl(270, 30%, 97%)",
        }}>
          {!selectedDataset ? (
            <>
              <CrystalBallIllustration />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
                  <GradientText>Upload a dataset </GradientText>
                  <span style={{
                    background: "linear-gradient(135deg, hsl(45, 95%, 55%), hsl(38, 90%, 55%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>to get started</span>
                </div>
                <div style={{ fontSize: 15, color: "hsl(270, 20%, 50%)" }}>
                  Drop a CSV in the sidebar and let's gooo 🚀
                </div>
              </div>
            </>
          ) : messages.length === 0 ? (
            <div style={{
              width: "100%",
              maxWidth: 700,
              background: "white",
              borderRadius: 16,
              padding: "20px 24px",
              border: "1px solid hsl(270, 20%, 90%)",
              boxShadow: "0 2px 16px hsla(270, 20%, 50%, 0.08)",
            }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                📊 {selectedDataset.name}
              </div>
              <div style={{ fontSize: 13, color: "hsl(270, 20%, 50%)" }}>
                Ready to analyze. Ask me anything about this dataset! 
                Try questions like "What are the column names?" or "Show me a summary of the data"
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  <ChatMessage message={msg.content} isUser={msg.role === 'user'} />
                  {(msg.chartSpec || msg.data) && <ChartDisplay chartSpec={msg.chartSpec} data={msg.data} />}
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                  <LoadingSpinner />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid hsl(270, 20%, 92%)",
          background: "hsl(270, 30%, 98%)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 50,
            background: selectedDataset ? "white" : "hsl(270, 20%, 95%)",
            border: "1px solid hsl(270, 20%, 88%)",
            boxShadow: selectedDataset ? "0 2px 12px hsla(270, 20%, 50%, 0.1)" : "none",
            transition: "all 0.2s",
          }}>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedDataset || isLoading}
              placeholder={selectedDataset ? "Ask about your data..." : "Upload and select a dataset to begin. ✨"}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                fontFamily: "'Space Grotesk', sans-serif",
                color: selectedDataset ? "hsl(270, 40%, 10%)" : "hsl(270, 10%, 55%)",
              }}
            />
            {selectedDataset && (
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  cursor: inputValue && !isLoading ? "pointer" : "default",
                  background: inputValue && !isLoading
                    ? "linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%))"
                    : "hsl(270, 20%, 88%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
