import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, Lightbulb } from "lucide-react";

const steps = [
  { n: "1", emoji: "📝", title: "Log earnings", desc: "Speak, scan, or type — add income and expenses in seconds" },
  { n: "2", emoji: "🤖", title: "Get AI tips", desc: "Personalised savings recommendations based on your spending patterns" },
  { n: "3", emoji: "💰", title: "Save smarter", desc: "Track goals, plan budgets, and grow your emergency fund" },
];

const occupations = [
  { emoji: "🚗", label: "Cab Drivers" },
  { emoji: "🛵", label: "Delivery Riders" },
  { emoji: "🏠", label: "Home Services" },
  { emoji: "💻", label: "Freelancers" },
];

const features = [
  { icon: Zap, title: "Instant Insights", desc: "AI analyses every transaction in real time" },
  { icon: TrendingUp, title: "Track Growth", desc: "See income trends, weekly and monthly" },
  { icon: Shield, title: "Bank-grade Security", desc: "Encrypted data, RLS-protected database" },
  { icon: Lightbulb, title: "Smart Tips", desc: "Recommendations tailored to gig workers" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center pt-16 pb-12 space-y-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" /> AI-powered Finance Coach
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Built for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Drivers,</span>
              <br />Riders &amp; Gig Heroes
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Track earnings, cut waste, and save more — your personal money coach for India's gig economy.
          </motion.p>

          {/* Occupation pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center">
            {occupations.map(({ emoji, label }) => (
              <span key={label} className="bg-muted px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                {emoji} {label}
              </span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex gap-3 justify-center flex-wrap pt-2">
            <Button size="lg" onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl hover:opacity-95 transition-all">
              Get Started Free →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="px-8 py-6 text-base">
              Login
            </Button>
          </motion.div>
        </motion.div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map(({ n, emoji, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-md flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center flex-shrink-0">
                  {n}
                </div>
                <div>
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="font-bold">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.08 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 border border-border text-center">
          <div className="grid grid-cols-3 gap-6">
            {[["50K+", "Gig Workers"], ["₹2Cr+", "Total Saved"], ["4.8★", "App Rating"]].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-3xl md:text-4xl font-black text-primary">{val}</p>
                <p className="text-sm text-muted-foreground mt-1">{lbl}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Landing;
