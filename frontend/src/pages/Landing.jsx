import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Zap, 
  Layers, 
  MessageSquare, 
  Play, 
  CheckCircle2, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  ChevronRight,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    { 
      title: "Natural Language Queries", 
      desc: "Ask questions about your data in plain English and get instant answers.",
      icon: <MessageSquare className="w-5 h-5 text-primary" />
    },
    { 
      title: "Smart Visualizations", 
      desc: "Automatically generate charts and graphs based on your data and queries.",
      icon: <BarChart3 className="w-5 h-5 text-secondary" />
    },
    { 
      title: "Multi-Format Support", 
      desc: "Upload CSV, Excel, or PDF files and start analyzing immediately.",
      icon: <Layers className="w-5 h-5 text-accent" />
    },
    { 
      title: "AI-Powered Insights", 
      desc: "Get intelligent suggestions and uncover patterns in your data.",
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    { 
      title: "Interactive Dashboards", 
      desc: "Explore your data with interactive visualizations and filters.",
      icon: <Cpu className="w-5 h-5 text-secondary" />
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      features: ["Up to 5,000 contacts", "Basic analytics", "Email support", "5 automation workflows"],
      buttonText: "Start Free Trial",
      accent: "from-primary/20 to-primary/5"
    },
    {
      name: "Pro",
      price: "$99",
      features: ["Up to 25,000 contacts", "Advanced AI insights", "Priority support", "Unlimited workflows", "A/B testing"],
      buttonText: "Get Pro Now",
      isPopular: true,
      accent: "from-secondary/20 to-secondary/5"
    },
    {
      name: "Enterprise",
      price: "$299",
      features: ["Custom contact limit", "Personalized onboarding", "Dedicated manager", "Custom API access", "SLA guarantee"],
      buttonText: "Contact Sales",
      accent: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass py-3 px-8 rounded-full border-white/20 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="/querio-logo.png" alt="Querio" className="w-10 h-10 object-contain" />
            <span className="font-bold text-2xl tracking-tight">
              querio
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['About Us', 'Features', 'Pricing', 'Experience'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2 rounded-full gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-2xl mb-12"
        >
          {/* Central Sphere Graphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="glass-card aspect-square max-w-[200px] mx-auto rounded-[40px] flex items-center justify-center relative z-10 p-8 border-white/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-full h-full rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center"
            >
              <Cpu className="w-12 h-12 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 text-[10px] font-bold uppercase tracking-widest text-primary mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            AI-Powered Data Analysis
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Query Data.<br />
            <span className="gradient-text">Get Insights.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-foreground/60 mb-12 leading-relaxed">
            Transform your raw data into actionable insights with natural language queries. 
            Upload, analyze, and visualize your data effortlessly with AI assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group glass-card px-8 py-4 rounded-2xl flex items-center gap-3 bg-white/40 hover:bg-white/60 transition-all border-white/40 overflow-hidden relative">
              <div className="flex flex-col items-start">
                <span className="text-primary font-bold text-lg">Start Free Trial</span>
                <span className="text-[10px] text-foreground/50">No credit card required</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                <ArrowRight className="text-white w-5 h-5" />
              </div>
            </Link>

            <button className="group glass px-8 py-4 rounded-2xl flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all border-white/20">
              <div className="flex flex-col items-start pr-4 border-r border-white/20">
                <span className="text-foreground font-bold text-lg">Book a Demo</span>
                <span className="text-[10px] text-foreground/50 text-left">Connect with our team</span>
              </div>
              <Play className="text-primary w-6 h-6 fill-primary" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-24 px-6 bg-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Engineered for <br /><span className="text-primary">Data Intelligence</span>
              </h2>
              <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
                Querio combines advanced natural language processing with powerful data analysis capabilities. 
                Ask questions in plain English and get instant insights from your datasets.
              </p>
              
              <div className="space-y-4">
                {[
                  "Natural language queries for data analysis",
                  "Real-time visualization and chart generation",
                  "Support for CSV, Excel, and PDF files"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Data Quality", value: "99.9%", icon: <ShieldCheck /> },
                { label: "Query Speed", value: "<1s", icon: <Zap /> },
                { label: "Active Users", value: "12k+", icon: <Linkedin /> },
                { label: "File Formats", value: "5+", icon: <Layers /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-3xl flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-black mb-1">{stat.value}</span>
                  <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Core Features</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Everything you need to analyze and visualize your data through natural language conversations.
          </p>
        </div>

        <div className="space-y-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass p-6 rounded-[2rem] flex items-center justify-between border-white/20 hover:border-primary/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <div className="hidden sm:block">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-foreground/50">{feature.desc}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative bg-primary/5 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Flexible Plans</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Choose the perfect tier for your business journey. Scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col glass-card p-10 rounded-[3rem] relative ${plan.isPopular ? 'ring-2 ring-primary border-primary/20 shadow-primary/10' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 rounded-full gradient-primary text-white text-[10px] font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                
                <span className="text-xs font-black uppercase tracking-widest text-primary mb-4">{plan.name}</span>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-foreground/40 font-bold">/month</span>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to="/register" 
                  className={`w-full py-4 rounded-2xl text-center font-bold text-sm transition-all ${
                    plan.isPopular 
                    ? 'gradient-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]' 
                    : 'glass border-white/40 hover:bg-white/80'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="glass-card p-12 md:p-20 rounded-[4rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent -z-10"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 block">Case Example</span>
              <h2 className="text-3xl font-black mb-8 leading-tight">"Within minutes of uploading my dataset, I had actionable insights that would have taken hours to extract manually."</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted"></div>
                <div>
                  <p className="font-bold">Anna Roberts</p>
                  <p className="text-xs text-foreground/40 font-medium">CEO at TrendyShop</p>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-8 rounded-3xl border-white/30">
                <p className="text-sm font-medium leading-relaxed mb-6 italic opacity-70">
                  "The natural language queries make data analysis accessible to everyone on our team, not just data scientists."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Analytics Team</span>
                </div>
              </div>
              <div className="glass p-8 rounded-3xl border-white/30 mt-8">
                <p className="text-sm font-medium leading-relaxed mb-6 italic opacity-70">
                  "Upload, query, visualize - all in one place. The chart generation is incredibly intuitive."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Data Analyst</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/10 mt-20 relative bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/querio-logo.png" alt="Querio" className="w-10 h-10 object-contain" />
                <span className="font-bold text-2xl tracking-tight">querio</span>
              </div>
              <p className="text-foreground/50 max-w-sm mb-8 leading-relaxed">
                Empowering everyone to analyze data through natural language. 
                Query your data, get insights, visualize results.
              </p>
              <div className="flex items-center gap-4">
                {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all text-foreground/60 hover:text-primary">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest opacity-30">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">Upload Data</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Query Builder</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Visualizations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Export</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest opacity-30">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between py-10 border-t border-white/10 text-xs font-medium text-foreground/40">
            <p>© 2026 Querio. All rights reserved.</p>
            <div className="flex items-center gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
