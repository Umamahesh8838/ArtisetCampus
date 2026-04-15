import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

const examTrend = [
  { name: "Jan", score: 65 }, { name: "Feb", score: 72 }, { name: "Mar", score: 78 },
  { name: "Apr", score: 75 }, { name: "May", score: 82 }, { name: "Jun", score: 88 },
];

const interviewPerf = [
  { name: "Technical", score: 82 }, { name: "HR", score: 90 }, { name: "Managerial", score: 75 },
  { name: "GD", score: 70 },
];

const skillGrowth = [
  { month: "Jan", skills: 5 }, { month: "Feb", skills: 7 }, { month: "Mar", skills: 8 },
  { month: "Apr", skills: 10 }, { month: "May", skills: 11 }, { month: "Jun", skills: 14 },
];

const funnel = [
  { stage: "Applied", count: 8 }, { stage: "Shortlisted", count: 5 },
  { stage: "Exam", count: 4 }, { stage: "Interview", count: 3 }, { stage: "Selected", count: 1 },
];

const PIE_COLORS = ["hsl(215, 70%, 50%)", "hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

export default function StudentAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your recruitment performance over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Exam Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={examTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(215, 70%, 50%)" strokeWidth={2} dot={{ fill: "hsl(215, 70%, 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Interview Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={interviewPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Skill Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={skillGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Area type="monotone" dataKey="skills" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Application Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis type="number" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis type="category" dataKey="stage" fontSize={12} stroke="hsl(220, 10%, 45%)" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(215, 70%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
