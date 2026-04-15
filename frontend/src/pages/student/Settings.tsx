import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Bell, Shield, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.email || ""
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';       

  // Always sync with the AuthContext user object when it becomes available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        first_name: prev.first_name || user.firstName || "",
        last_name: prev.last_name || user.lastName || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${apiUrl}/student/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.basic) {
            setFormData(prev => ({
              first_name: data.profile.basic.firstName || prev.first_name,
              last_name: data.profile.basic.lastName || prev.last_name,
              email: data.profile.basic.email || prev.email
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiUrl]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${apiUrl}/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Account updated successfully!");
      } else {
        toast.error("Failed to update account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

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
            <div>
              <Label>First Name</Label>
              <Input 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
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
