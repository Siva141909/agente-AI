import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Menu, X, Sun, Moon, Bell, Zap } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/transactions": "Transactions",
  "/tips": "Tips",
  "/stats": "Stats",
  "/budget": "Budget",
  "/risk": "Risk Analysis",
  "/actions": "Action Plan",
  "/tax": "Tax",
  "/benefits": "Benefits",
  "/profile": "Profile",
};

const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return document.documentElement.classList.contains("dark");
  });

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    else if (saved === "light") document.documentElement.classList.remove("dark");
  }, []);

  return { dark, toggle };
};

const TopBar = () => {
  const location = useLocation();
  const { user, logout } = useApp();
  const { isOpen, toggle } = useSidebar();
  const { dark, toggle: toggleDark } = useDarkMode();
  const navigate = useNavigate();

  const currentPageTitle = pageTitles[location.pathname] || "Agente AI";

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center px-4 md:px-6 h-14 gap-3">

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggle}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <X size={18} className="text-muted-foreground" /> : <Menu size={18} className="text-muted-foreground" />}
        </button>

        {/* Mobile: App logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <Zap size={14} />
          </div>
          <span className="text-[13px] font-bold">Agente AI</span>
        </div>

        {/* Page title */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <h1 className="text-[16px] font-semibold text-foreground">{currentPageTitle}</h1>
        </div>

        {/* Right: Dark mode + Bell + Avatar */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark
              ? <Sun size={16} className="text-muted-foreground" />
              : <Moon size={16} className="text-muted-foreground" />}
          </button>

          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors">
            <Bell size={16} className="text-muted-foreground" />
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-muted/60 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-[12px]">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-[13px] font-medium max-w-[100px] truncate">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.phone || user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { logout(); navigate("/"); }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
