import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Phone, Loader2, ShieldCheck, KeyRound, EyeOff, Eye } from "lucide-react";

const API_BASE = "http://localhost:3000";
const OTP_LENGTH = 6;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [contact, setContact] = useState("");

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Password State
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetting, setResetting] = useState(false);

    const validateContact = () => {
        if (!contact) {
            toast.error("Please enter your email or phone number");
            return false;
        }
        if (method === "email" && !/\S+@\S+\.\S+/.test(contact)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (method === "phone" && !/^\d{10}$/.test(contact.replace(/\D/g, ""))) {
            toast.error("Please enter a valid 10-digit phone number");
            return false;
        }
        return true;
    };

    const handleSendOtp = async () => {
        if (!validateContact()) return;
        setSendingOtp(true);
        try {
            const endpoint = method === "email" ? "/auth/send-email-otp" : "/auth/send-phone-otp";
            const payload = method === "email" ? { email: contact } : { phone: contact };

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP");

            toast.success("OTP sent successfully");
            setOtpSent(true);

            // Start timer
            setResendTimer(60);
            const timer = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) clearInterval(timer);
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || "Failed to send OTP");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            toast.error("Please enter the complete 6-digit OTP");
            return;
        }
        setVerifyingOtp(true);
        try {
            const endpoint = method === "email" ? "/auth/verify-email-otp" : "/auth/verify-phone-otp";
            const payload = method === "email" ? { email: contact, otp: code } : { phone: contact, otp: code };

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Verification failed");

            toast.success(`${method === "email" ? "Email" : "Phone"} verified successfully`);
            setOtpVerified(true);
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please enter and confirm your new password");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setResetting(true);
        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: contact, new_password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Password reset failed");

            toast.success("Password reset successfully! Please sign in.");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.message || "Failed to reset password");
        } finally {
            setResetting(false);
        }
    };

    // OTP Helpers
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[400px] space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-foreground">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">Verify your identity to choose a new password</p>
                </div>

                <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">

                        {/* Step 1 & 2: Identifier and OTP */}
                        <div className={`space-y-4 transition-all duration-300 ${otpVerified ? 'hidden' : 'block'}`}>
                            <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => { setMethod("email"); setContact(""); setOtpSent(false); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${method === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                    disabled={otpSent}
                                >
                                    <Mail className="w-4 h-4" /> Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMethod("phone"); setContact(""); setOtpSent(false); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${method === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                    disabled={otpSent}
                                >
                                    <Phone className="w-4 h-4" /> Phone
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-foreground">
                                    {method === "email" ? "Email Address" : "Phone Number"}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type={method === "email" ? "email" : "tel"}
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                        placeholder={method === "email" ? "you@example.com" : "9876543210"}
                                        className="h-10 text-sm flex-1"
                                        disabled={otpSent}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || resendTimer > 0}
                                        className="h-10 px-4 whitespace-nowrap text-sm"
                                        variant={otpSent ? "outline" : "default"}
                                    >
                                        {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : resendTimer > 0 ? `${resendTimer}s` : otpSent ? "Resend" : "Send OTP"}
                                    </Button>
                                </div>
                            </div>

                            {otpSent && !otpVerified && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2 space-y-3">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                                        <div className="flex-1 flex justify-center gap-1.5" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={el => { inputRefs.current[i] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    className="w-10 h-10 rounded-md border border-input bg-background font-bold justify-center text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={verifyingOtp || otp.join("").length < OTP_LENGTH}
                                            className="h-10 px-4 text-xs"
                                            variant="secondary"
                                        >
                                            {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 3: New Password */}
                        {otpVerified && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-medium text-sm">
                                            <ShieldCheck className="w-4 h-4" /> Identity Verified
                                        </div>
                                        <div className="text-xs text-muted-foreground">{contact}</div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[13px] font-medium text-foreground">New Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-10 text-sm pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[13px] font-medium text-foreground">Confirm New Password</label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleResetPassword}
                                    disabled={resetting}
                                    className="w-full h-11 font-semibold"
                                >
                                    {resetting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</span> : "Reset Password"}
                                </Button>
                            </div>
                        )}

                    </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
