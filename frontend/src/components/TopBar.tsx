import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Menu, X, Bell, Zap } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard":    "Home",
  "/transactions": "Transactions",
  "/tips":         "Tips",
  "/stats":        "Statistics",
  "/budget":       "Budget",
  "/risk":         "Risk Analysis",
  "/actions":      "Action Plan",
  "/tax":          "Tax",
  "/benefits":     "Benefits",
  "/profile":      "Profile",
};

const CYAN = "#00D4FF";

const TopBar = () => {
  const location = useLocation();
  const { user, logout } = useApp();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();

  const currentPageTitle = pageTitles[location.pathname] ?? "Agente AI";
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{
        background: "rgba(7,13,26,0.92)",
        borderBottom: "1px solid hsl(210 46% 19%)",
      }}
    >
      <div className="flex items-center px-4 md:px-6 h-14 gap-3">

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggle}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0"
          style={{ color: "#6B8CAE" }}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(210 46% 19%)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile: App logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            <Zap size={14} style={{ color: CYAN }} />
          </div>
          <span className="text-[13px] font-bold font-display" style={{ color: "#E8F4FF" }}>
            Agente AI
          </span>
        </div>

        {/* Page title */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <h1
            className="text-[15px] font-semibold font-display"
            style={{ color: "#E8F4FF" }}
          >
            {currentPageTitle}
          </h1>
        </div>

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#6B8CAE" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(210 46% 19%)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={16} />
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 h-8 px-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(210 46% 19%)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[12px]"
                    style={{
                      background: "rgba(0,212,255,0.15)",
                      border: "1px solid rgba(0,212,255,0.35)",
                      color: CYAN,
                    }}
                  >
                    {initials}
                  </div>
                  <span
                    className="hidden md:block text-[13px] font-medium max-w-[100px] truncate"
                    style={{ color: "#E8F4FF" }}
                  >
                    {user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52"
                style={{
                  background: "hsl(215 56% 12%)",
                  border: "1px solid hsl(210 46% 19%)",
                }}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate" style={{ color: "#E8F4FF" }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#6B8CAE" }}>
                    {user.phone || user.email}
                  </p>
                </div>
                <DropdownMenuSeparator style={{ background: "hsl(210 46% 19%)" }} />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                  style={{ color: "#E8F4FF" }}
                >
                  <User className="w-4 h-4 mr-2" />Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ background: "hsl(210 46% 19%)" }} />
                <DropdownMenuItem
                  onClick={() => { logout(); navigate("/"); }}
                  className="cursor-pointer"
                  style={{ color: "#FF3366" }}
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
