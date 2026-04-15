import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2, FileText, GraduationCap, Video, Award,
  TrendingUp, BarChart3, Code2, BookOpen, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CHART_COLORS = ["hsl(215, 70%, 50%)", "hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 55%)"];

const skillData = [
  { name: "Technical", value: 40 },
  { name: "Communication", value: 25 },
  { name: "Aptitude", value: 20 },
  { name: "Projects", value: 15 },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // updated key to 'authToken'
    if (!token) {
      navigate("/login");
      return;
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const fetchData = () => {
      fetch(`${apiUrl}/student/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch dashboard data");
          return res.json();
        })
        .then(data => {
          setData(data);
        })
        .catch(err => {
          console.error(err);
          // Only show toast on initial load to avoid spamming
          if (loading) toast.error("Error loading dashboard data. Are you logged in?");
        })
        .finally(() => setLoading(false));
    };

    fetchData(); // Initial fetch
    
    // Poll every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const profileCompletion = 100; // Since they reached here, registration is complete
  const { 
    applications = [], 
    openDrives = [], 
    upcomingInterview, 
    certifications = 0, 
    skills = 0, 
    cgpa = "0.0",
    examData = [],
    avgExamScore = 0,
    interviewScore = 0,
    nextExam = "None Scheduled"
  } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your recruitment overview.</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/student/profile")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profile</p>
                <p className="text-xl font-bold text-foreground">{profileCompletion}%</p>
              </div>
            </div>
            <Progress value={profileCompletion} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="text-xl font-bold text-foreground">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Exam</p>
                <p className="text-sm font-bold text-foreground">{nextExam}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interview</p>
                <p className="text-sm font-bold text-foreground">{upcomingInterview ? upcomingInterview.date : "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Certifications</p>
                <p className="text-xl font-bold text-foreground">{certifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Available Drives Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Available Drives</CardTitle>
              <button onClick={() => navigate("/student/drives")} className="text-xs text-primary hover:underline">View All</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {openDrives.length === 0 ? <p className="text-sm text-muted-foreground">No open drives available.</p> : openDrives.map((drive: any) => (
              <div key={drive.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => navigate(`/student/drives/${drive.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{drive.logo}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{drive.company}</p>
                    <p className="text-xs text-muted-foreground">{drive.role} · {drive.location}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">{drive.experience}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? <p className="text-sm text-muted-foreground">You haven't applied to any drives yet.</p> : applications.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                </div>
                <Badge className={`text-xs capitalize ${app.status?.toLowerCase() === "selected" ? "bg-amber-100 text-amber-700 border-0" : app.status?.toLowerCase() === "in progress" ? "bg-warning/10 text-warning border-0" : "bg-primary/10 text-primary border-0"}`}>
                  {app.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row - Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Exam Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(215, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{avgExamScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Exam Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{interviewScore}%</p>
                <p className="text-xs text-muted-foreground">Interview Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{cgpa}</p>
                <p className="text-xs text-muted-foreground">CGPA</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{skills}</p>
                <p className="text-xs text-muted-foreground">Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
