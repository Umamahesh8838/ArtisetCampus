import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const selectionFunnel = [
  { stage: "Applied", count: 770 }, { stage: "Shortlisted", count: 450 },
  { stage: "Exam Cleared", count: 280 }, { stage: "Interview", count: 180 }, { stage: "Selected", count: 85 },
];

const moduleDifficulty = [
  { module: "DSA", easy: 85, medium: 65, hard: 42 },
  { module: "DBMS", easy: 90, medium: 72, hard: 48 },
  { module: "OOP", easy: 82, medium: 60, hard: 38 },
  { module: "Networking", easy: 78, medium: 58, hard: 35 },
];

const interviewerRate = [
  { name: "Rajesh K.", pass: 72 }, { name: "Priya S.", pass: 65 }, { name: "Amit V.", pass: 80 },
  { name: "Sneha D.", pass: 58 }, { name: "Karthik N.", pass: 75 },
];

const PIE_COLORS = ["hsl(215, 70%, 50%)", "hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 55%)"];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive recruitment analytics and reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Drive-wise Selection Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={selectionFunnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="stage" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(215, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Module Difficulty Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moduleDifficulty}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="module" fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 45%)" />
                <Tooltip />
                <Bar dataKey="easy" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hard" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Interviewer Pass Rate (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={interviewerRate} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis type="number" fontSize={12} stroke="hsl(220, 10%, 45%)" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="hsl(220, 10%, 45%)" width={80} />
                <Tooltip />
                <Bar dataKey="pass" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
