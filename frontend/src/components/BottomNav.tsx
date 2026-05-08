import { useState } from "react";
import { Home, BarChart3, Lightbulb, User, MoreHorizontal, Wallet, DollarSign, AlertTriangle, Zap, TrendingUp, Award, Plus, Mic, Camera, PenLine, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import VoiceModal from "@/components/VoiceModal";
import ScanModal from "@/components/ScanModal";
import TransactionModal from "@/components/TransactionModal";

interface BadgeProps { count?: number }
const NavBadge = ({ count }: BadgeProps) =>
  count ? (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  ) : null;

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: BarChart3, label: "Transactions", path: "/transactions" },
    null, // FAB placeholder
    { icon: Lightbulb, label: "Tips", path: "/tips" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const moreItems = [
    { icon: Wallet, label: "Budget", path: "/budget" },
    { icon: TrendingUp, label: "Stats", path: "/stats" },
    { icon: DollarSign, label: "Tax", path: "/tax" },
    { icon: AlertTriangle, label: "Risk", path: "/risk" },
    { icon: Zap, label: "Actions", path: "/actions" },
    { icon: Award, label: "Benefits", path: "/benefits" },
  ];

  const fabActions = [
    { icon: Mic, label: "Speak", color: "from-blue-500 to-blue-600", action: () => { setFabOpen(false); setVoiceOpen(true); } },
    { icon: Camera, label: "Scan", color: "from-purple-500 to-purple-600", action: () => { setFabOpen(false); setScanOpen(true); } },
    { icon: PenLine, label: "Enter", color: "from-green-500 to-green-600", action: () => { setFabOpen(false); setTxOpen(true); } },
  ];

  return (
    <>
      {/* More drawer backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More drawer */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-4 pb-6 shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Financial Tools</p>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMoreOpen(false); }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors",
                    isActive(path) ? "bg-primary/10 text-primary" : "bg-muted/50 text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB action sheet backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB action sheet */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-6 shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <p className="text-sm font-semibold text-muted-foreground text-center mb-4">How do you want to add?</p>
            <div className="grid grid-cols-3 gap-3">
              {fabActions.map(({ icon: Icon, label, color, action }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.95 }}
                  onClick={action}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-semibold">{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-30 md:hidden">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item, i) => {
            if (!item) {
              // FAB center button
              return (
                <motion.button
                  key="fab"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setMoreOpen(false); setFabOpen((v) => !v); }}
                  className="relative -top-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg flex items-center justify-center"
                >
                  <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Plus className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              );
            }

            const { icon: Icon, label, path } = item;
            const active = isActive(path);
            const isMore = label === "More";

            return (
              <button
                key={path}
                onClick={() => {
                  setFabOpen(false);
                  if (isMore) { setMoreOpen((v) => !v); return; }
                  navigate(path);
                }}
                className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1"
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
                  <NavBadge />
                </div>
                <span className={cn("text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => { setFabOpen(false); setMoreOpen((v) => !v); }}
            className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1"
          >
            <MoreHorizontal className={cn("w-5 h-5 transition-colors", moreOpen ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium", moreOpen ? "text-primary" : "text-muted-foreground")}>More</span>
          </button>
        </div>
      </nav>

      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} />
    </>
  );
};

export default BottomNav;
