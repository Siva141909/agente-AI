import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Phone, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

// Returns 0–4: 0=empty, 1=weak, 2=fair, 3=good, 4=strong
function passwordStrength(p: string): number {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)) score++;
  return score;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useApp();

  const [step, setStep] = useState<"credentials" | "profile">(
    searchParams.get("profile") ? "profile" : "credentials"
  );

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", occupation: "", city: "" });
  const [isLoading, setIsLoading] = useState(false);

  const strength = passwordStrength(password);

  const validateCredentials = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { toast.error("Please enter a valid 10-digit phone number"); return false; }
    if (!/^[6-9]/.test(digits)) { toast.error("Indian mobile numbers must start with 6, 7, 8, or 9"); return false; }
    if (strength < 4) {
      toast.error("Password must be 8+ chars with uppercase, lowercase, number, and special character");
      return false;
    }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleNext = () => {
    if (validateCredentials()) setStep("profile");
  };

  const handleSignup = async () => {
    if (!profile.full_name.trim()) { toast.error("Please enter your full name"); return; }
    if (!profile.occupation) { toast.error("Please select your occupation"); return; }
    if (!profile.city.trim()) { toast.error("Please enter your city"); return; }
    try {
      setIsLoading(true);
      await signup(phone, password, profile.full_name.trim(), profile.occupation, profile.city.trim());
      toast.success(`Welcome, ${profile.full_name.trim()}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = step === "credentials" ? 1 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  s <= progress ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Credentials */}
            {step === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Create account</h2>
                    <p className="text-muted-foreground text-sm">Set up your login credentials</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-lg border border-border text-sm font-medium text-muted-foreground">
                      <Phone className="w-4 h-4 mr-1" />+91
                    </div>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, A-Z, 0-9, symbol"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColor[strength] : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength:{" "}
                        <span className={strength >= 4 ? "text-green-500 font-semibold" : "font-medium"}>
                          {strengthLabel[strength]}
                        </span>
                        {strength < 4 && (
                          <span className="ml-1">
                            — need: {[
                              password.length < 8 && "8+ chars",
                              !(/[A-Z]/.test(password) && /[a-z]/.test(password)) && "A-Z a-z",
                              !/\d/.test(password) && "0-9",
                              !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) && "symbol",
                            ].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
                      {password === confirmPassword
                        ? <><Check className="w-3 h-3" /> Passwords match</>
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-primary"
                  disabled={phone.length !== 10 || strength < 4 || password !== confirmPassword || !confirmPassword}
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
                    Login here
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP 2: Profile */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your profile</h2>
                    <p className="text-muted-foreground text-sm">Help us personalize your experience</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="Rajesh Kumar"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      autoFocus
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Select
                      value={profile.occupation}
                      onValueChange={(v) => setProfile({ ...profile, occupation: v })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Uber Driver">Uber Driver</SelectItem>
                        <SelectItem value="Ola Driver">Ola Driver</SelectItem>
                        <SelectItem value="Swiggy Partner">Swiggy Partner</SelectItem>
                        <SelectItem value="Zomato Partner">Zomato Partner</SelectItem>
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {!searchParams.get("profile") && (
                    <Button
                      variant="outline"
                      onClick={() => setStep("credentials")}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />Back
                    </Button>
                  )}
                  <Button
                    onClick={handleSignup}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                    disabled={isLoading || !profile.full_name.trim() || !profile.occupation || !profile.city.trim()}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
                    ) : (
                      "Start Using Agente AI"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
