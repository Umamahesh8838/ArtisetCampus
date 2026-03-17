import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GraduationCap, ArrowLeft, ShieldCheck, Mail, Phone } from "lucide-react";

const FAKE_OTP = "123456";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister || false;
  const userContact = location.state?.contact || "";
  const contactType = location.state?.contactType || "email";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [otpSent, setOtpSent] = useState(!!userContact);
  const [contact, setContact] = useState(userContact);
  const [method, setMethod] = useState<"email" | "phone">(contactType);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleSendOtp = () => {
    if (!contact.trim()) {
      toast.error(`Please enter your ${method === "email" ? "email address" : "phone number"}`);
      return;
    }
    if (method === "email" && !/\S+@\S+\.\S+/.test(contact)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (method === "phone" && !/^\d{10}$/.test(contact.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setOtpSent(true);
    setResendTimer(RESEND_COOLDOWN);
    toast.success(`OTP sent to ${contact}`, { description: "Use code: 123456 for demo" });
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (code === FAKE_OTP) {
        localStorage.setItem("artiset_logged_in", "true");
        localStorage.setItem("artiset_otp_verified", "true");
        toast.success("Verification successful!");
        const registered = localStorage.getItem("artiset_registration_complete") === "true";
        navigate(fromRegister || !registered ? "/registration" : "/student/dashboard");
      } else {
        toast.error("Invalid OTP. Please try again.", { description: "Hint: Use 123456" });
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
      setLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    setResendTimer(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    toast.success("OTP resent successfully!", { description: "Use code: 123456 for demo" });
    inputRefs.current[0]?.focus();
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
            Secure verification<br />for your safety.
          </h2>
          <p className="text-primary-foreground/70 text-sm max-w-sm">
            We use OTP verification to keep your account safe and ensure only you can access your profile.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/50 text-xs">© 2026 Artiset Campus. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">Artiset Campus</h1>
          </div>

          {!otpSent ? (
            /* Step 1: Enter contact */
            <div className="space-y-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl text-foreground">Verify your identity</h2>
                <p className="text-sm text-muted-foreground">We'll send a 6-digit code to verify your account</p>
              </div>

              {/* Method toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => { setMethod("email"); setContact(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${method === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  onClick={() => { setMethod("phone"); setContact(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${method === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {method === "email" ? "Email Address" : "Phone Number"}
                </label>
                <Input
                  type={method === "email" ? "email" : "tel"}
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder={method === "email" ? "you@example.com" : "9876543210"}
                  className="h-11"
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                />
              </div>

              <Button onClick={handleSendOtp} className="w-full h-11 font-semibold">
                Send OTP
              </Button>
            </div>
          ) : (
            /* Step 2: Enter OTP */
            <div className="space-y-6">
              <button onClick={() => setOtpSent(false)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Change {method}
              </button>

              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h2 className="font-display font-bold text-2xl text-foreground">Enter verification code</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{contact}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-14 rounded-xl border-2 border-input bg-background text-center text-xl font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                ))}
              </div>

              <Button onClick={handleVerify} className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} className="text-sm text-primary font-medium hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground text-center">
                  🔑 <span className="font-medium">Demo mode:</span> Use code <span className="font-mono font-bold text-foreground">123456</span> to verify
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
