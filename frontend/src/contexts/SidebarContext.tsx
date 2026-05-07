import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpenState] = useState(() => {
    // Load from localStorage or default based on screen size
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_open");
      if (saved !== null) {
        return saved === "true";
      }
      // Default: open on desktop, closed on mobile
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebar_open", String(isOpen));
  }, [isOpen]);

  const toggle = () => {
    setIsOpenState((prev) => !prev);
  };

  const setIsOpen = (open: boolean) => {
    setIsOpenState(open);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};



