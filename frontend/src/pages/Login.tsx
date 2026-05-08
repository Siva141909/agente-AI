import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LogIn, Phone } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.replace(/\D/g, "").length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!/^[6-9]/.test(phone)) {
      toast.error("Indian mobile numbers must start with 6, 7, 8, or 9");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    try {
      setIsLoading(true);
      await login(phone, password);
      // Check if profile is complete
      try {
        const userData = await api.users.me();
        if (!userData.occupation || userData.full_name === "User" || !userData.city) {
          toast.success("Welcome! Please complete your profile.");
          navigate("/signup?profile=1");
        } else {
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      } catch {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome back!</h2>
              <p className="text-muted-foreground text-sm">Login with your phone &amp; password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-lg border border-border text-sm font-medium text-muted-foreground">
                  <Phone className="w-4 h-4 mr-1" />+91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                  className="flex-1"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={isLoading || phone.length !== 10 || !password}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" />Login</>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary hover:underline font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
