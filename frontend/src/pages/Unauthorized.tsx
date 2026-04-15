import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate("/login")}>
            Login to different account
          </Button>
        </div>
      </div>
    </div>
  );
}
