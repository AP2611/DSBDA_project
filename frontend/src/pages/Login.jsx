import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      onLogin(data.access_token);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="flex flex-col items-center mb-10">
            <Link to="/" className="group flex items-center gap-3 mb-8">
              <img src="/querio-logo.png" alt="Querio" className="w-12 h-12 object-contain" />
              <span className="font-bold text-2xl tracking-tight">querio</span>
            </Link>
            
            <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-foreground/50 text-sm font-medium">Sign in to your data analysis dashboard</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-foreground/40">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-primary text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-foreground/40 font-medium">
              New to the platform?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          <a href="#" className="hover:text-foreground/50 transition-colors">Privacy</a>
          <div className="w-1 h-1 rounded-full bg-foreground/20"></div>
          <a href="#" className="hover:text-foreground/50 transition-colors">Terms</a>
          <div className="w-1 h-1 rounded-full bg-foreground/20"></div>
          <a href="#" className="hover:text-foreground/50 transition-colors">Security</a>
        </div>
      </motion.div>
    </div>
  );
}
