import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, text: "AI-Powered Insights" },
    { icon: TrendingUp, text: "Track Your Growth" },
    { icon: Shield, text: "Secure & Private" },
    { icon: Zap, text: "Instant Recommendations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 py-20"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block"
          >
            <div className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Agente AI
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
          >
            Your Money.
            <br />
            <span className="text-primary">Your Way.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          >
            Your personal finance coach for the gig economy. Smart insights, better savings, brighter
            future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              Start Now →
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-12"
        >
          {features.map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
            >
              <Icon className="w-8 h-8 text-primary mb-3 mx-auto" />
              <p className="text-sm font-medium text-center">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="max-w-4xl mx-auto mt-20 bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground mt-2">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success">₹2Cr+</div>
              <div className="text-sm text-muted-foreground mt-2">Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary">95%</div>
              <div className="text-sm text-muted-foreground mt-2">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
