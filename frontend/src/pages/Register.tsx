import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GraduationCap, Mail, ShieldCheck, Loader2, Phone } from "lucide-react";

const API_BASE = "http://localhost:3000";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const Register = () => {
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step state - Email
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step state - Phone
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Loading & timer
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  // Resend countdowns
  const startEmailResendTimer = () => {
    setEmailResendTimer(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setEmailResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const startPhoneResendTimer = () => {
    setPhoneResendTimer(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setPhoneResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ---------------- EMAIL OTP ----------------
  const handleSendEmailOtp = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in first name, last name, and email before continuing");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSendingEmailOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email OTP");
      toast.success("Email OTP generated. Check backend console.");
      setEmailOtpSent(true);
      startEmailResendTimer();
      setTimeout(() => emailInputRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      toast.error(err.message || "Failed to send email OTP");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const code = emailOtp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit email OTP");
      return;
    }
    setVerifyingEmailOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email OTP verification failed");
      toast.success("Email verified successfully");
      setEmailOtpVerified(true);
    } catch (err: any) {
      toast.error(err.message || "Email OTP verification failed");
      setEmailOtp(Array(OTP_LENGTH).fill(""));
      emailInputRefs.current[0]?.focus();
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  // ---------------- PHONE OTP ----------------
  const handleSendPhoneOtp = async () => {
    if (!contactNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }
    setSendingPhoneOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send phone OTP");
      toast.success("Phone OTP generated. Check backend console.");
      setPhoneOtpSent(true);
      startPhoneResendTimer();
      setTimeout(() => phoneInputRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      toast.error(err.message || "Failed to send phone OTP");
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const code = phoneOtp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit phone OTP");
      return;
    }
    setVerifyingPhoneOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactNumber, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Phone OTP verification failed");
      toast.success("Phone verified successfully");
      setPhoneOtpVerified(true);
    } catch (err: any) {
      toast.error(err.message || "Phone OTP verification failed");
      setPhoneOtp(Array(OTP_LENGTH).fill(""));
      phoneInputRefs.current[0]?.focus();
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtpVerified || !phoneOtpVerified) {
      toast.error("Please verify both email and phone before signing up");
      return;
    }
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in the password fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSigningUp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: contactNumber,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      localStorage.setItem("token", data.token);
      toast.success("Signup successful!");
      navigate("/registration");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setSigningUp(false);
    }
  };

  // OTP Input Helpers
  const createOtpChangeHandler = (type: "email" | "phone") => (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const otpState = type === "email" ? emailOtp : phoneOtp;
    const setOtpState = type === "email" ? setEmailOtp : setPhoneOtp;
    const refs = type === "email" ? emailInputRefs : phoneInputRefs;

    const newOtp = [...otpState];
    newOtp[index] = value.slice(-1);
    setOtpState(newOtp);
    if (value && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const createOtpKeyDownHandler = (type: "email" | "phone") => (index: number, e: React.KeyboardEvent) => {
    const otpState = type === "email" ? emailOtp : phoneOtp;
    const refs = type === "email" ? emailInputRefs : phoneInputRefs;
    if (e.key === "Backspace" && !otpState[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const createOtpPasteHandler = (type: "email" | "phone") => (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const otpState = type === "email" ? emailOtp : phoneOtp;
    const setOtpState = type === "email" ? setEmailOtp : setPhoneOtp;
    const refs = type === "email" ? emailInputRefs : phoneInputRefs;

    const newOtp = [...otpState];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtpState(newOtp);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-primary relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full bg-primary-foreground" />
          <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-primary-foreground" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl text-primary-foreground">Artiset Campus</h1>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="font-display font-bold text-3xl text-primary-foreground leading-tight">
            Build your student<br />profile today.
          </h2>
          <p className="text-primary-foreground/70 text-sm max-w-sm">
            Join thousands of students who've already registered and started their career journey with Artiset Campus.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/50 text-xs">© 2026 Artiset Campus. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/10 h-screen overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-4 py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">Artiset Campus</h1>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground">Complete verification to register</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
              <div className="space-y-4">

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[13px] font-medium text-foreground">First Name</label>
                    <Input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="John"
                      className="h-10 text-sm"
                      disabled={emailOtpSent}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[13px] font-medium text-foreground">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="h-10 text-sm"
                      disabled={emailOtpSent}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  {!emailOtpVerified ? (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-10 text-sm flex-1"
                        disabled={emailOtpSent}
                      />
                      <Button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={sendingEmailOtp || emailResendTimer > 0}
                        className="h-10 px-4 whitespace-nowrap text-sm"
                        variant={emailOtpSent ? "outline" : "default"}
                      >
                        {sendingEmailOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : emailResendTimer > 0 ? (
                          `${emailResendTimer}s`
                        ) : emailOtpSent ? (
                          "Resend"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                      <span className="text-sm text-foreground/80">{email}</span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    </div>
                  )}

                  {emailOtpSent && !emailOtpVerified && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex-1 flex justify-center gap-1.5" onPaste={createOtpPasteHandler("email")}>
                          {emailOtp.map((digit, i) => (
                            <input
                              key={`email-${i}`}
                              ref={el => { emailInputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => createOtpChangeHandler("email")(i, e.target.value)}
                              onKeyDown={e => createOtpKeyDownHandler("email")(i, e)}
                              className="w-8 h-10 rounded-md border border-input bg-background justify-center text-center text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={verifyingEmailOtp || emailOtp.join("").length < OTP_LENGTH}
                          className="h-10 px-3 text-xs"
                          variant="secondary"
                        >
                          {verifyingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone (Unlocks after Email) */}
                <div className={`space-y-1 transition-all duration-300 ${emailOtpVerified ? 'opacity-100 h-auto' : 'opacity-40 pointer-events-none'}`}>
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  {!phoneOtpVerified ? (
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        placeholder="9876543210"
                        className="h-10 text-sm flex-1"
                        disabled={phoneOtpSent || !emailOtpVerified}
                      />
                      <Button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={sendingPhoneOtp || phoneResendTimer > 0 || !emailOtpVerified}
                        className="h-10 px-4 whitespace-nowrap text-sm"
                        variant={phoneOtpSent ? "outline" : "default"}
                      >
                        {sendingPhoneOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : phoneResendTimer > 0 ? (
                          `${phoneResendTimer}s`
                        ) : phoneOtpSent ? (
                          "Resend"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                      <span className="text-sm text-foreground/80">{contactNumber}</span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    </div>
                  )}

                  {phoneOtpSent && !phoneOtpVerified && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex-1 flex justify-center gap-1.5" onPaste={createOtpPasteHandler("phone")}>
                          {phoneOtp.map((digit, i) => (
                            <input
                              key={`phone-${i}`}
                              ref={el => { phoneInputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => createOtpChangeHandler("phone")(i, e.target.value)}
                              onKeyDown={e => createOtpKeyDownHandler("phone")(i, e)}
                              className="w-8 h-10 rounded-md border border-input bg-background font-bold justify-center text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={handleVerifyPhoneOtp}
                          disabled={verifyingPhoneOtp || phoneOtp.join("").length < OTP_LENGTH}
                          className="h-10 px-3 text-xs"
                          variant="secondary"
                        >
                          {verifyingPhoneOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password (Unlocks after Phone) */}
                {phoneOtpVerified && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[13px] font-medium text-foreground">Password</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-medium text-foreground">Confirm</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-3 animate-in fade-in slide-in-from-bottom-2">
                  <Button
                    type="button"
                    onClick={handleSignup}
                    className="w-full h-11 font-semibold text-base"
                    disabled={!emailOtpVerified || !phoneOtpVerified || signingUp}
                  >
                    {signingUp ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

