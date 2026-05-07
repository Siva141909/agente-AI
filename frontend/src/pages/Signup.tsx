import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { db } from "@/services/database";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Phone, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOtp, verifyOtp } = useApp();
  const [step, setStep] = useState<"phone" | "otp" | "profile">(
    searchParams.get("profile") ? "profile" : "phone"
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    occupation: "",
    city: "",
  });
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const progress = step === "phone" ? 1 : step === "otp" ? 2 : 3;

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, "").length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!/^[6-9]/.test(phone)) {
      toast.error("Indian mobile numbers must start with 6, 7, 8, or 9");
      return;
    }
    try {
      setIsLoading(true);
      await sendOtp(phone);
      toast.success("OTP sent to +91 " + phone);
      setStep("otp");
      startResendTimer();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await sendOtp(phone);
      toast.success("OTP resent to +91 " + phone);
      startResendTimer();
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    try {
      setIsLoading(true);
      await verifyOtp(phone, token);
      setStep("profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!profile.full_name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!profile.occupation) {
      toast.error("Please select your occupation");
      return;
    }
    if (!profile.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("Session expired. Please start over.");
      await db.auth.updateProfile(userId, {
        full_name: profile.full_name,
        occupation: profile.occupation,
        city: profile.city,
        ...(profile.email ? { email: profile.email } : {}),
      });
      toast.success(`Welcome ${profile.full_name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

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
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  s <= progress ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Phone */}
            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Let's get started</h2>
                    <p className="text-muted-foreground text-sm">Create your Agente AI account</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-lg border border-border text-sm font-medium text-muted-foreground">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      disabled={isLoading}
                      className="flex-1"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send a one-time password to verify your number
                  </p>
                </div>

                <Button
                  onClick={handleSendOtp}
                  className="w-full bg-primary"
                  disabled={isLoading || phone.length !== 10}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending OTP...</>
                  ) : (
                    <>Send OTP<ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
                    Login here
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Verify number</h2>
                    <p className="text-muted-foreground text-sm">
                      Enter the OTP sent to +91 {phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold"
                      autoFocus={i === 0}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="text-center text-sm">
                  {resendTimer > 0 ? (
                    <p className="text-muted-foreground">
                      Resend OTP in <span className="font-semibold text-primary">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-primary hover:underline font-medium disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />Back
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    className="flex-1 bg-primary"
                    disabled={isLoading || otp.join("").length !== 6}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
                    ) : (
                      <>Verify<ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Profile */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Select
                      value={profile.occupation}
                      onValueChange={(v) => setProfile({ ...profile, occupation: v })}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCompleteProfile}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    "Start Using Agente AI"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
