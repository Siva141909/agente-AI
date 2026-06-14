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
      { label: "Home",         icon: LayoutDashboard, path: "/dashboard" },
      { label: "Transactions", icon: BarChart3,        path: "/transactions" },
      { label: "Tips",         icon: Lightbulb,        path: "/tips" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Stats",    icon: TrendingUp,  path: "/stats" },
      { label: "Budget",   icon: Wallet,      path: "/budget" },
      { label: "Tax",      icon: DollarSign,  path: "/tax" },
      { label: "Risk",     icon: AlertCircle, path: "/risk" },
      { label: "Actions",  icon: CheckCircle, path: "/actions" },
      { label: "Benefits", icon: Award,       path: "/benefits" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: User, path: "/profile" },
    ],
  },
];

const CYAN = "#00D4FF";

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
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ background: "hsl(215 56% 12%)", border: "1px solid hsl(210 46% 19%)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen
          ? <X size={18} style={{ color: CYAN }} />
          : <Menu size={18} style={{ color: CYAN }} />}
      </motion.button>

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300",
          isOpen ? "translate-x-0 w-56" : "-translate-x-full md:translate-x-0 md:w-[60px]"
        )}
        style={{
          background: "hsl(215 56% 12%)",
          borderRight: "1px solid hsl(210 46% 19%)",
        }}
      >
        {/* Logo */}
        <div
          className="px-3 py-3.5 flex items-center gap-2.5 relative h-14 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(210 46% 19%)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            <Zap size={16} style={{ color: CYAN }} />
          </div>

          {isOpen && (
            <div className="overflow-hidden">
              <p
                className="text-[14px] font-bold tracking-tight whitespace-nowrap font-display"
                style={{ color: "#E8F4FF" }}
              >
                Agente AI
              </p>
              <p className="text-[10px] whitespace-nowrap" style={{ color: "#6B8CAE" }}>
                Finance Command
              </p>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center z-50 transition-colors"
            style={{
              background: "hsl(215 56% 12%)",
              border: "1px solid hsl(210 46% 19%)",
            }}
          >
            {isOpen
              ? <ChevronLeft size={12} style={{ color: "#6B8CAE" }} />
              : <ChevronRight size={12} style={{ color: "#6B8CAE" }} />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {groups.map((group, gi) => (
            <div key={group.label} className="mb-1">
              {isOpen && (
                <p
                  className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1.5"
                  style={{ color: "#334D6E" }}
                >
                  {group.label}
                </p>
              )}
              {!isOpen && gi > 0 && (
                <div className="my-1.5 mx-2" style={{ borderTop: "1px solid hsl(210 46% 19%)" }} />
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
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all relative",
                      !isOpen && "justify-center"
                    )}
                    style={
                      active
                        ? { background: "rgba(0,212,255,0.10)", color: CYAN }
                        : { color: "#6B8CAE" }
                    }
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#E8F4FF";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#6B8CAE";
                    }}
                  >
                    {/* Active cyan left accent */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1 bottom-1 rounded-full"
                        style={{ width: 2, background: CYAN, boxShadow: `0 0 8px ${CYAN}` }}
                      />
                    )}
                    <Icon size={17} className="flex-shrink-0" />
                    {isOpen && (
                      <span className="text-[13px] whitespace-nowrap font-medium">{label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom agent status strip */}
        {isOpen && (
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ borderTop: "1px solid hsl(210 46% 19%)" }}
          >
            <span className="agent-dot agent-dot-active" />
            <span className="text-[11px]" style={{ color: "#6B8CAE" }}>Agent online</span>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(7,13,26,0.7)" }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
