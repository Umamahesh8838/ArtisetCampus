import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Rocket, FileText, TrendingUp, Award, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import client from "../../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    client.get("/admin/dashboard")
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-center animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Campus recruitment overview and analytics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Students", value: stats.totalStudents, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Active Drives", value: stats.activeDrives, icon: Rocket, color: "bg-success/10 text-success" },
          { label: "Applications", value: stats.totalApplications, icon: FileText, color: "bg-warning/10 text-warning" },
          { label: "Total Companies", value: stats.totalCompanies, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
          { label: "Avg Exam Score", value: stats.avgExamScore, icon: Award, color: "bg-amber-100 text-amber-600" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Applications per Drive</CardTitle></CardHeader>
          <CardContent>
            {stats.appsByDrive?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.appsByDrive}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                  <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(215, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No drive application data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pass Rate per Round</CardTitle></CardHeader>
          <CardContent>
             {stats.passRate?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.passRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                  <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                  <Tooltip />
                  <Bar dataKey="pass" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fail" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No exam data available</div>
             )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">College-wise Performance</CardTitle></CardHeader>
          <CardContent>
             {stats.collegePerf?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.collegePerf} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis type="number" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                  <YAxis type="category" dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" width={50} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No college statistics</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
