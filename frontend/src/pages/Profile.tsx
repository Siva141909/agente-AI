import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, LogOut, Eye, EyeOff, ShieldCheck, User, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import db from "@/services/database";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import HelpTooltip from "@/components/HelpTooltip";
import { SkeletonCard } from "@/components/ui/skeleton-card";

const S = {
  surface:  "hsl(215 56% 12%)",
  surface2: "hsl(215 49% 15%)",
  border:   "hsl(210 46% 19%)",
  cyan:     "#00D4FF",
  danger:   "#FF3366",
  textPri:  "#E8F4FF",
  textSec:  "#6B8CAE",
};

const Profile = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "", phone_number: "", email: "", date_of_birth: "",
    preferred_language: "en", occupation: "", city: "", state: "", pin_code: "",
    monthly_income_min: "", monthly_income_max: "", monthly_expenses_avg: "",
    emergency_fund_target: "", current_emergency_fund: "",
    risk_tolerance: "moderate", dependents: 0,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!user && !userId) { navigate("/signup"); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [userData, profileData] = await Promise.all([
        db.users.getMe(),
        db.users.getProfile().catch(() => null),
      ]);
      setFormData({
        full_name: userData.full_name || "",
        phone_number: userData.phone_number || "",
        email: userData.email?.replace(/@agente\.local$/, "") || "",
        date_of_birth: userData.date_of_birth || "",
        preferred_language: userData.preferred_language || "en",
        occupation: userData.occupation || "",
        city: userData.city || "",
        state: userData.state || "",
        pin_code: userData.pin_code || "",
        monthly_income_min: profileData?.monthly_income_min?.toString() || "",
        monthly_income_max: profileData?.monthly_income_max?.toString() || "",
        monthly_expenses_avg: profileData?.monthly_expenses_avg?.toString() || "",
        emergency_fund_target: profileData?.emergency_fund_target?.toString() || "",
        current_emergency_fund: profileData?.current_emergency_fund?.toString() || "",
        risk_tolerance: profileData?.risk_tolerance || "moderate",
        dependents: profileData?.dependents || 0,
      });
    } catch { toast.error("Failed to load profile"); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await Promise.all([
        db.users.updateMe({
          full_name: formData.full_name,
          email: formData.email || undefined,
          date_of_birth: formData.date_of_birth || undefined,
          preferred_language: formData.preferred_language,
          occupation: formData.occupation,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pin_code,
        } as any),
        db.users.updateProfile({
          monthly_income_min: formData.monthly_income_min ? parseFloat(formData.monthly_income_min) : undefined,
          monthly_income_max: formData.monthly_income_max ? parseFloat(formData.monthly_income_max) : undefined,
          monthly_expenses_avg: formData.monthly_expenses_avg ? parseFloat(formData.monthly_expenses_avg) : undefined,
          emergency_fund_target: formData.emergency_fund_target ? parseFloat(formData.emergency_fund_target) : undefined,
          current_emergency_fund: formData.current_emergency_fund ? parseFloat(formData.current_emergency_fund) : undefined,
          risk_tolerance: formData.risk_tolerance as any,
          dependents: formData.dependents,
        } as any),
      ]);
      toast.success("Profile saved!");
    } catch { toast.error("Failed to save profile"); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    try {
      setIsChangingPwd(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password changed successfully!");
      setNewPassword(""); setConfirmPassword("");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to change password"); }
    finally { setIsChangingPwd(false); }
  };

  if (isLoading) {
    return <div className="space-y-4 pb-24 md:pb-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  const f = formData;
  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [k]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

        {/* Avatar + header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.35)", color: S.cyan }}>
            {f.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: S.textPri }}>{f.full_name || "Your Profile"}</h1>
            <p className="text-sm" style={{ color: S.textSec }}>{f.occupation}{f.city ? ` · ${f.city}` : ""}</p>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["basic"]} className="space-y-3">

          {/* Basic Info */}
          <AccordionItem value="basic" className="border rounded-lg px-5" style={{ background: S.surface, borderColor: S.border }}>
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 font-semibold" style={{ color: S.textPri }}>
                <User className="w-4 h-4" style={{ color: S.cyan }} /> Basic Information
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name",    key: "full_name" },
                  { label: "Phone Number", key: "phone_number", disabled: true },
                  { label: "Email",        key: "email",        type: "email" },
                  { label: "Date of Birth",key: "date_of_birth",type: "date" },
                  { label: "Occupation",   key: "occupation" },
                  { label: "City",         key: "city" },
                  { label: "State",        key: "state" },
                  { label: "PIN Code",     key: "pin_code" },
                ].map(({ label, key, type = "text", disabled }) => (
                  <div key={key} className="space-y-1.5">
                    <Label style={{ color: S.textSec }}>{label}{disabled && <span className="text-xs ml-1 opacity-60">(locked)</span>}</Label>
                    <Input type={type} value={(f as any)[key]} onChange={set(key as keyof typeof formData)} disabled={disabled} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label style={{ color: S.textSec }}>Preferred Language</Label>
                  <Select value={f.preferred_language} onValueChange={(v) => setFormData({ ...f, preferred_language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[["en","English"],["hi","Hindi"],["mr","Marathi"],["bn","Bengali"],["ta","Tamil"]].map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Profile */}
          <AccordionItem value="financial" className="border rounded-lg px-5" style={{ background: S.surface, borderColor: S.border }}>
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 font-semibold" style={{ color: S.textPri }}>
                <BarChart3 className="w-4 h-4" style={{ color: S.cyan }} /> Financial Profile
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Monthly Income (Min) ₹",  key: "monthly_income_min" },
                  { label: "Monthly Income (Max) ₹",  key: "monthly_income_max" },
                  { label: "Avg Monthly Expenses ₹",  key: "monthly_expenses_avg" },
                  { label: "Emergency Fund Target ₹",  key: "emergency_fund_target" },
                  { label: "Current Emergency Fund ₹", key: "current_emergency_fund" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <Label style={{ color: S.textSec }}>{label}</Label>
                    <Input type="number" inputMode="decimal" value={(f as any)[key]} onChange={set(key as keyof typeof formData)} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label style={{ color: S.textSec }}>Risk Tolerance</Label>
                    <HelpTooltip text="How comfortable you are with financial risk." />
                  </div>
                  <Select value={f.risk_tolerance} onValueChange={(v) => setFormData({ ...f, risk_tolerance: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label style={{ color: S.textSec }}>Dependents</Label>
                    <HelpTooltip text="Family members who depend on your income." />
                  </div>
                  <Input type="number" value={f.dependents} onChange={(e) => setFormData({ ...f, dependents: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem value="security" className="border rounded-lg px-5" style={{ background: S.surface, borderColor: S.border }}>
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 font-semibold" style={{ color: S.textPri }}>
                <ShieldCheck className="w-4 h-4" style={{ color: S.cyan }} /> Security
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: S.textSec }}>New Password</Label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="pr-10" />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.textSec }}>
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: S.textSec }}>Confirm New Password</Label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="pr-10" />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.textSec }}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs" style={{ color: S.danger }}>Passwords do not match</p>
                  )}
                </div>
                <Button onClick={handleChangePassword} disabled={isChangingPwd || !newPassword || newPassword !== confirmPassword} variant="outline">
                  {isChangingPwd ? "Changing…" : "Change Password"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Logout */}
        <Card className="p-5" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: S.textPri }}>Sign out</p>
              <p className="text-sm" style={{ color: S.textSec }}>You'll need to log in again</p>
            </div>
            <Button variant="destructive" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </Card>

      </motion.div>

      {/* ── Sticky Save button at bottom ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-center p-4 md:left-[60px]"
        style={{ background: "rgba(7,13,26,0.85)", backdropFilter: "blur(12px)", borderTop: `1px solid ${S.border}` }}
      >
        <div className="w-full max-w-2xl">
          <Button onClick={handleSave} disabled={isSaving} className="w-full" style={{ background: S.cyan, color: "#070D1A", fontWeight: 600 }}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
