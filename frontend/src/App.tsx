import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Transactions from "./pages/Transactions";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import Tips from "./pages/Tips";
import Profile from "./pages/Profile";
import Budget from "./pages/Budget";
import Tax from "./pages/Tax";
import Benefits from "./pages/Benefits";
import RiskDashboard from "./pages/RiskDashboard";
import Actions from "./pages/Actions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/login" element={<Auth />} />

      {/* Protected Routes with Sidebar Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Transactions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Stats />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tips"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Tips />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Budget />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Tax />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/benefits"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Benefits />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RiskDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/actions"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Actions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </SidebarProvider>
      </AppProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
