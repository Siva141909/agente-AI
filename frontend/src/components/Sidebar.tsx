import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  LayoutDashboard, BarChart3, Lightbulb, Wallet, TrendingUp,
  AlertCircle, CheckCircle, User, Menu, X, Zap,
  ChevronLeft, ChevronRight, Award, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const groups = [
  {
    label: "Main",
    items: [
      { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Transactions", icon: BarChart3, path: "/transactions" },
      { label: "Tips", icon: Lightbulb, path: "/tips" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Stats", icon: TrendingUp, path: "/stats" },
      { label: "Budget", icon: Wallet, path: "/budget" },
      { label: "Tax", icon: DollarSign, path: "/tax" },
      { label: "Risk", icon: AlertCircle, path: "/risk" },
      { label: "Actions", icon: CheckCircle, path: "/actions" },
      { label: "Benefits", icon: Award, path: "/benefits" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: User, path: "/profile" },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, setIsOpen } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-br from-primary to-secondary text-white p-2.5 rounded-lg shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      <motion.div
        initial={false}
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r border-border/40 flex flex-col z-40 shadow-sm transition-all duration-300",
          isOpen ? "translate-x-0 w-56" : "-translate-x-full md:translate-x-0 md:w-[60px]"
        )}
      >
        {/* Logo */}
        <div className="px-3 py-3.5 border-b border-border/30 flex items-center gap-2.5 relative h-14">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white flex-shrink-0">
            <Zap size={16} />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-[14px] font-bold tracking-tight whitespace-nowrap">Agente AI</p>
              <p className="text-[11px] text-muted-foreground whitespace-nowrap">Finance Coach</p>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border shadow-sm items-center justify-center z-50 hover:bg-muted transition-colors"
          >
            {isOpen ? <ChevronLeft size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {groups.map((group) => (
            <div key={group.label} className="mb-1">
              {isOpen && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  {group.label}
                </p>
              )}
              {!isOpen && group.label !== groups[0].label && (
                <div className="my-1.5 mx-2 border-t border-border/40" />
              )}
              {group.items.map(({ label, icon: Icon, path }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    onClick={() => {
                      navigate(path);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    title={!isOpen ? label : undefined}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all group relative",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      !isOpen && "justify-center"
                    )}
                  >
                    {/* Active left accent */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary"
                      />
                    )}
                    <Icon size={17} className="flex-shrink-0" />
                    {isOpen && (
                      <span className="text-[13px] whitespace-nowrap">{label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
