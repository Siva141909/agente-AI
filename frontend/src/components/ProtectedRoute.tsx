import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    
    // If not loading and not authenticated and no user_id, redirect to login
    if (!isLoading && !isAuthenticated && !userId) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-[15px] text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user_id exists (for testing or if auth state is not synced)
  const userId = localStorage.getItem('user_id');
  if (!isAuthenticated && !userId) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};


