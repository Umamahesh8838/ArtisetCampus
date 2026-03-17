import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>First Name</Label><Input defaultValue="Rahul" /></div>
            <div><Label>Last Name</Label><Input defaultValue="Sharma" /></div>
          </div>
          <div><Label>Email</Label><Input defaultValue="rahul@example.com" type="email" /></div>
          <Button onClick={() => toast.success("Account updated!")} size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Email notifications for new drives", "SMS alerts for interview schedules", "Push notifications for application updates", "Weekly summary digest"].map((label, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{label}</span>
              <Switch defaultChecked={i < 2} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Profile visible to recruiters</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Show contact information</span>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
