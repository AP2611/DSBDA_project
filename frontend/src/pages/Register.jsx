import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      navigate("/login", { 
        state: { message: "Registration successful! Please log in." } 
      });
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
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
        className="w-full max-w-lg"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="flex flex-col items-center mb-10">
            <Link to="/" className="group flex items-center gap-3 mb-8">
              <img src="/querio-logo.png" alt="Querio" className="w-12 h-12 object-contain" />
              <span className="font-bold text-2xl tracking-tight">querio</span>
            </Link>
            
            <h1 className="text-3xl font-black mb-2 tracking-tight">Create Account</h1>
            <p className="text-foreground/50 text-sm font-medium">Start analyzing your data with AI</p>
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="arjunp"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="arjun@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">Confirm</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border-white/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="col-span-1 md:col-span-2 w-full gradient-primary text-white py-4 mt-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-foreground/40 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "Security", desc: "Enterprise-grade", icon: <CheckCircle2 className="w-3 h-3 text-secondary" /> },
            { label: "Speed", desc: "Instant Analysis", icon: <CheckCircle2 className="w-3 h-3 text-secondary" /> },
            { label: "Support", desc: "24/7 Expert Help", icon: <CheckCircle2 className="w-3 h-3 text-secondary" /> }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1 outline-none">
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{item.label}</span>
              </div>
              <span className="text-[9px] font-medium text-foreground/20 italic">{item.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
