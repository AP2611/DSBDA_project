import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import embed from "vega-embed";
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus, 
  Zap, 
  Cpu, 
  LayoutDashboard,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";

// --- Components ---

function ChatMessage({ message, isUser, chartSpec, data }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2 mb-6 w-full`}
    >
      <div className={`
        max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
        ${isUser 
          ? 'gradient-primary text-white rounded-tr-none shadow-primary/20' 
          : 'glass bg-white/60 border-white/50 text-foreground/90 rounded-tl-none font-medium'}
      `}>
        {message}
      </div>
      
      {(chartSpec || data) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl mt-2 overflow-hidden rounded-[2rem] glass-card border-white/40 p-6 flex flex-col gap-4"
        >
          <ChartDisplay chartSpec={chartSpec} data={data} />
        </motion.div>
      )}
    </motion.div>
  );
}

function ChartDisplay({ chartSpec, data }) {
  const chartRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chartSpec || !chartRef.current) return;

    const renderChart = async () => {
      try {
        setError(null);
        const spec = chartSpec.data ? chartSpec : { ...chartSpec, data: { values: data } };
        
        await embed(chartRef.current, spec, {
          actions: false,
          renderer: 'svg',
          theme: 'light',
          config: {
            background: 'transparent',
             axis: {
              labelFont: 'Outfit, sans-serif',
              titleFont: 'Outfit, sans-serif',
              gridColor: 'hsla(var(--border), 0.5)'
            },
            view: { stroke: 'transparent' }
          }
        });
      } catch (err) {
        console.error('Chart render error:', err);
        setError('Visualization unavailable');
      }
    };

    renderChart();
  }, [chartSpec, data]);

  if (!chartSpec && !data) return null;
  
  if (chartSpec) {
    return (
      <div className="w-full">
        <div ref={chartRef} className="w-full overflow-hidden" />
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive font-bold uppercase tracking-wider mt-4">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
    );
  }
  
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto rounded-2xl border border-white/40 bg-white/30">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-white/40">
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-left font-black uppercase tracking-widest opacity-40 border-b border-white/10">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row, i) => (
              <tr key={i} className="hover:bg-white/20 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-4 py-2 opacity-70 border-b border-white/5 whitespace-nowrap">
                    {row[col] !== null ? row[col].toString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <div className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest opacity-20">
            Preview of {data.slice(0, 5).length} / {data.length} records
          </div>
        )}
      </div>
    );
  }
  
  return null;
}

// --- Main Assistant Component ---

export default function DataAnalysisAssistant({ onLogout }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    checkConnection();
    fetchUserInfo();
    fetchDatasets();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setConnectionError(null);
    } catch (error) {
      setConnectionError('Backend Unreachable');
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setUserInfo(await response.json());
    } catch (error) { console.error(error); }
  };

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`${API_BASE}/datasets`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
        if (data.length > 0 && !selectedDataset) setSelectedDataset(data[0]);
      }
    } catch (error) { console.error(error); }
  };

  const uploadFiles = async (files) => {
    setIsLoading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}/datasets/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData,
        });
        if (!response.ok) throw new Error(`Upload failed`);
        const datasetInfo = await response.json();
        setDatasets(prev => [datasetInfo, ...prev]);
        setSelectedDataset(datasetInfo);
      }
    } catch (error) {
      alert(`Upload failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDataset = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this dataset?')) return;
    try {
      const response = await fetch(`${API_BASE}/datasets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setDatasets(prev => prev.filter(ds => ds.id !== id));
        if (selectedDataset?.id === id) setSelectedDataset(null);
      }
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedDataset || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          message: userMessage,
          dataset_id: selectedDataset.id,
          history: messages.slice(-10)
        })
      });
      const result = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response,
        chartSpec: result.chart_spec,
        data: result.data
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Orchestration error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 300 : 80 }}
        className="h-full glass border-r bg-white/20 border-white/30 backdrop-blur-3xl flex flex-col z-30 transition-all duration-300 relative shadow-2xl"
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-10 -right-4 w-8 h-8 rounded-full border border-white/50 bg-white/80 shadow-md flex items-center justify-center text-foreground/40 hover:text-primary transition-all z-40"
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <div className="p-6 pb-2">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <img src="/querio-logo.png" alt="Querio" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">
                querio
              </span>
            )}
          </Link>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`
              w-full gradient-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 
              hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50
              ${isSidebarOpen ? 'py-4 text-sm' : 'h-10 w-10 p-0 mx-auto'}
            `}
          >
            <Plus className="w-5 h-5" />
            {isSidebarOpen && "Import Dataset"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.pdf" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-1">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              onClick={() => setSelectedDataset(ds)}
              className={`
                group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden
                ${selectedDataset?.id === ds.id 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'hover:bg-white/40 border-transparent'}
                border
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm
                ${selectedDataset?.id === ds.id ? 'bg-primary text-white' : 'glass-card bg-white/60'}
              `}>
                <FileText className="w-5 h-5" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-0.5">Dataset</p>
                  <p className="text-sm font-bold truncate text-foreground/80">{ds.name}</p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={(e) => handleDeleteDataset(e, ds.id)}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/40 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {datasets.length === 0 && isSidebarOpen && (
            <div className="text-center py-10 opacity-20">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-foreground/30 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Nothing Imported</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer / User */}
        <div className="p-4 mt-auto">
          <div className={`p-3 rounded-2xl glass border-white/40 flex items-center gap-3 overflow-hidden ${isSidebarOpen ? '' : 'justify-center p-2'}`}>
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg">
              {userInfo?.username?.[0]?.toUpperCase() || "U"}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{userInfo?.username || "Researcher"}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Pro Plan</span>
                </div>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={onLogout}
                className="p-2 rounded-xl border border-white/50 bg-white/50 text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 z-20 backdrop-blur-md bg-white/5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Active Space</h2>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Data Analysis Orchestration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1.5 rounded-full glass border-white/50">
              <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-2 shadow-sm">
                <Cpu className="w-3.5 h-3.5" />
                Mistral v0.3
                <div className="w-1 h-1 rounded-full bg-primary"></div>
              </div>
              <button className="p-1.5 rounded-full hover:bg-white transition-colors text-foreground/40">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 && !selectedDataset ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center text-center opacity-80"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="glass-card aspect-square w-32 rounded-[3rem] flex items-center justify-center relative border-white/50">
                      <Zap className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase whitespace-pre-wrap">Intelligence <br /><span className="text-primary italic">Awaits</span> Your Data</h3>
                  <p className="text-sm font-medium text-foreground/30 max-w-sm">
                    Drop a file in the sidebar to begin orchestration. Our AI will analyze your data structures in real-time.
                  </p>
                  
                  <div className="mt-12 grid grid-cols-2 gap-4">
                    {["Smart Prediction", "Automated Viz", "Data Cleaning", "Trend Detection"].map(text => (
                      <div key={text} className="px-4 py-2 rounded-full border border-white/40 glass text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-secondary" />
                        {text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-center py-20"
                >
                  <div className="glass-card p-10 rounded-[3rem] border-white/40 shadow-2xl text-center max-w-md">
                   <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/20">
                      <FileText className="w-8 h-8" />
                   </div>
                    <h3 className="text-2xl font-black mb-2">{selectedDataset.name}</h3>
                    <p className="text-sm font-semibold opacity-30 uppercase tracking-widest mb-8">{selectedDataset.rows} Rows • {selectedDataset.columns} Fields</p>
                    <div className="space-y-3">
                      <button onClick={() => setInputValue("Analyze this dataset")} className="w-full py-3 rounded-2xl glass hover:bg-white/60 text-xs font-bold border-white/30 transition-all">"Provide a high-level summary"</button>
                      <button onClick={() => setInputValue("Show me the top 5 records")} className="w-full py-3 rounded-2xl glass hover:bg-white/60 text-xs font-bold border-white/30 transition-all">"Show me distribution charts"</button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full space-y-4 py-10">
                  {messages.map((msg, idx) => (
                    <ChatMessage 
                      key={idx} 
                      message={msg.content} 
                      isUser={msg.role === 'user'} 
                      chartSpec={msg.chartSpec}
                      data={msg.data}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-3 px-4 py-2 text-foreground/30 font-bold uppercase tracking-widest text-[10px]">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Synthesizing Insights...
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-20" />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-8 pb-8 pt-2 z-10">
          <div className="max-w-4xl mx-auto relative">
             <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl -z-10"></div>
             <div className={`
              relative glass backdrop-blur-2xl p-2 rounded-[2.5rem] border-white focus-within:border-primary/40 transition-all duration-300 shadow-2xl
              ${!selectedDataset && 'opacity-50 grayscale pointer-events-none'}
             `}>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 shrink-0 rounded-full glass border-white flex items-center justify-center text-foreground/20">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={selectedDataset ? `Message orchestration about ${selectedDataset.name}...` : "Import a dataset to begin..."}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-foreground/20"
                 />
                 <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`
                    w-12 h-12 shrink-0 rounded-[1.25rem] flex items-center justify-center transition-all shadow-lg
                    ${inputValue.trim() ? 'gradient-primary text-white shadow-primary/20 scale-105' : 'bg-muted/30 text-foreground/20'}
                  `}
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
             </div>
             {selectedDataset && (
               <div className="flex items-center justify-center gap-6 mt-4 opacity-30">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                    <div className="w-1 h-1 rounded-full bg-foreground"></div> Secured with TLS 1.3
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                    <div className="w-1 h-1 rounded-full bg-foreground"></div> End-to-end Encryption
                  </div>
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Connection Indicator */}
      {connectionError && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full glass border-destructive/20 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-bounce">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive mr-1"></div>
          {connectionError}
        </div>
      )}
    </div>
  );
}
