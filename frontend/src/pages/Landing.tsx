import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeuralGrid from "@/components/NeuralGrid";

const steps = [
  { n: "01", title: "Log earnings", desc: "Speak, scan, or type — add income and expenses in seconds" },
  { n: "02", title: "Get AI tips", desc: "Personalised savings recommendations based on your spending patterns" },
  { n: "03", title: "Save smarter", desc: "Track goals, plan budgets, and grow your emergency fund" },
];

const occupations = [
  { emoji: "🚗", label: "Cab Drivers" },
  { emoji: "🛵", label: "Delivery Riders" },
  { emoji: "🏠", label: "Home Services" },
  { emoji: "💻", label: "Freelancers" },
];

const features = [
  { icon: Zap,        title: "Instant Insights",    desc: "AI analyses every transaction in real time" },
  { icon: TrendingUp, title: "Track Growth",         desc: "See income trends, weekly and monthly" },
  { icon: Shield,     title: "Bank-grade Security",  desc: "Encrypted data, RLS-protected database" },
  { icon: Lightbulb,  title: "Smart Tips",           desc: "Recommendations tailored to gig workers" },
];

const tickerItems = [
  "₹2Cr+ Saved",  "50K+ Workers",  "4.8★ Rating",  "Real-time AI",
  "Bank-grade Security",  "Zero Fees",  "230M Gig Workers",  "Always Synced",
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#070D1A" }}
    >
      {/* Animated dot grid */}
      <NeuralGrid />

      {/* Content above the grid */}
      <div className="relative z-10">

        {/* Nav */}
        <nav
          className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)" }}
            >
              <Zap size={16} style={{ color: "#00D4FF" }} />
            </div>
            <span className="font-display font-bold text-[15px]" style={{ color: "#E8F4FF" }}>
              Agente AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-[13px]"
              style={{ color: "#6B8CAE" }}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="text-[13px] font-semibold"
              style={{
                background: "rgba(0,212,255,0.12)",
                border: "1px solid rgba(0,212,255,0.35)",
                color: "#00D4FF",
                boxShadow: "0 0 12px rgba(0,212,255,0.15)",
              }}
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 text-center pt-16 pb-8 space-y-6">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="inline-flex items-center gap-2 text-[12px] font-semibold px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "#00D4FF",
              }}
            >
              <span className="agent-dot agent-dot-active w-1.5 h-1.5" />
              AI-powered Finance for 230M Gig Workers
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="font-display text-5xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "#E8F4FF" }}
          >
            Built for{" "}
            <span className="gradient-text-cyan">Drivers,</span>
            <br />
            Riders &amp; Gig Heroes
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-xl mx-auto"
            style={{ color: "#6B8CAE" }}
          >
            Track earnings, cut waste, and save more — your personal money coach for India's gig economy.
          </motion.p>

          {/* Occupation pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {occupations.map(({ emoji, label }) => (
              <span
                key={label}
                className="text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid hsl(210 46% 19%)",
                  color: "#E8F4FF",
                }}
              >
                {emoji} {label}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 justify-center flex-wrap pt-2"
          >
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="px-8 py-6 text-base font-bold font-display"
              style={{
                background: "#00D4FF",
                color: "#070D1A",
                boxShadow: "0 0 30px rgba(0,212,255,0.30)",
              }}
            >
              Get Started Free →
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="px-8 py-6 text-base"
              style={{
                background: "transparent",
                border: "1px solid hsl(210 46% 19%)",
                color: "#E8F4FF",
              }}
            >
              Login
            </Button>
          </motion.div>
        </div>

        {/* Ticker strip */}
        <div className="ticker-wrap py-3 mb-16" style={{ borderTop: "1px solid hsl(210 46% 19%)", borderBottom: "1px solid hsl(210 46% 19%)" }}>
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-6 text-[13px] font-medium whitespace-nowrap"
                style={{ color: "#6B8CAE" }}
              >
                <span style={{ color: "#00D4FF", opacity: 0.6 }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h2
              className="text-2xl font-bold font-display text-center mb-8"
              style={{ color: "#E8F4FF" }}
            >
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map(({ n, title, desc }, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="glass-card glass-card-hover p-6 flex gap-4"
                >
                  <div
                    className="text-[11px] font-bold font-mono flex-shrink-0 mt-1"
                    style={{ color: "#00D4FF" }}
                  >
                    {n}
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: "#E8F4FF" }}>{title}</p>
                    <p className="text-[13px]" style={{ color: "#6B8CAE" }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.08 }}
                className="glass-card glass-card-hover p-5 text-center"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(0,212,255,0.10)", border: "1px solid rgba(0,212,255,0.2)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#00D4FF" }} />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#E8F4FF" }}>{title}</p>
                <p className="text-xs" style={{ color: "#6B8CAE" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="glass-card p-8 md:p-12 text-center"
            style={{ borderColor: "rgba(0,212,255,0.15)" }}
          >
            <div className="grid grid-cols-3 gap-6">
              {[["50K+", "Gig Workers"], ["₹2Cr+", "Total Saved"], ["4.8★", "App Rating"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p
                    className="text-3xl md:text-4xl font-black font-display data-value"
                    style={{ color: "#00D4FF" }}
                  >
                    {val}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#6B8CAE" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
