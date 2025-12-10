import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  Lightbulb,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useApp();
  const { isOpen, setIsOpen } = useSidebar();

  const menuItems = [
    {
      label: "Home",
      icon: LayoutDashboard,
      path: "/dashboard",
      description: "Overview",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Transactions",
      icon: BarChart3,
      path: "/transactions",
      description: "All Transactions",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Tips",
      icon: Lightbulb,
      path: "/tips",
      description: "Recommendations",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Stats",
      icon: BarChart3,
      path: "/stats",
      description: "Analytics",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      label: "Budget",
      icon: Wallet,
      path: "/budget",
      description: "Budgeting",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Risk Analysis",
      icon: AlertCircle,
      path: "/risk",
      description: "Risk Management",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      label: "Action Plan",
      icon: CheckCircle,
      path: "/actions",
      description: "Financial Goals",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      label: "Tax",
      icon: TrendingUp,
      path: "/tax",
      description: "Tax Analysis",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      label: "Benefits",
      icon: Award,
      path: "/benefits",
      description: "Government Schemes",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
      description: "Account",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-br from-primary to-secondary text-white p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar - Desktop sticky, Mobile overlay */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -300,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r border-border/40 backdrop-blur-sm transition-all duration-300 z-40 shadow-[0_0_1px_0_rgba(0,0,0,0.1)] flex flex-col overflow-hidden",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        {/* Logo Section */}
        <div className="px-4 py-3.5 border-b border-border/30 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-[13px] flex-shrink-0">
              <Zap size={16} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-[15px] font-semibold tracking-tight text-foreground whitespace-nowrap">
                Agente AI
              </p>
                <p className="text-[11px] text-muted-foreground whitespace-nowrap">Finance Coach</p>
            </div>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex absolute top-1/2 -right-2.5 transform -translate-y-1/2 w-5 h-5 rounded-[3px] bg-background border border-border/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.1)] items-center justify-center z-50 transition-all"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft size={12} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={12} className="text-muted-foreground" />
            )}
          </button>
              </div>


        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                  onClick={() => {
                    navigate(item.path);
                  // Only close on mobile
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                  }}
                  className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] transition-colors group relative",
                    active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  !isOpen && "justify-center"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {isOpen && (
                  <div className="flex-1 text-left overflow-hidden min-w-0">
                    <p className="text-[13px] font-medium whitespace-nowrap truncate">{item.label}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

      </motion.div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
