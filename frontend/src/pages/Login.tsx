import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !password) {
      toast.error("Please fill in all fields");
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

    setLoading(true);
    try {
      const response = await login(contact, password);
      const data = response.data;

      if (data.is_registration_complete !== undefined) {
        localStorage.setItem("artiset_registration_complete", data.is_registration_complete ? "true" : "false");
      } else if (data.user?.is_registration_complete !== undefined) {
        localStorage.setItem("artiset_registration_complete", data.user.is_registration_complete ? "true" : "false");
      }
      
      toast.success("Welcome back!");

      // Navigate based on role and registration status after a small delay
      setTimeout(() => {
        if (data.user.role === 'admin' || data.user.role === 'tpo') {
          navigate("/admin/dashboard", { replace: true });
        } else if (data.is_registration_complete || data.user?.is_registration_complete) {
          navigate("/student/dashboard", { replace: true });
        } else {
          navigate("/registration", { replace: true });
        }
      }, 800);
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
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
            Your academic journey<br />starts here.
          </h2>
          <p className="text-primary-foreground/70 text-sm max-w-sm">
            Complete your student profile to unlock internships, projects, and career opportunities tailored for you.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/50 text-xs">© 2026 Artiset Campus. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">Artiset Campus</h1>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue your registration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Method toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => { setMethod("email"); setContact(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${method === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => { setMethod("phone"); setContact(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${method === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Phone className="w-4 h-4" /> Phone
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {method === "email" ? "Email" : "Phone Number"}
              </label>
              <Input
                type={method === "email" ? "email" : "tel"}
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder={method === "email" ? "you@example.com" : "9876543210"}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
