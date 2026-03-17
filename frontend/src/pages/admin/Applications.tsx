import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STATUS_COLORS } from "@/data/mockData";
import { Search } from "lucide-react";

const MOCK_APPS = [
  { id: "1", student: "Rahul Sharma", college: "MIT Pune", cgpa: 8.5, drive: "Infosys", status: "in-progress", round: "Technical Interview" },
  { id: "2", student: "Priya Patel", college: "VIT Vellore", cgpa: 9.1, drive: "TCS", status: "shortlisted", round: "Online Assessment" },
  { id: "3", student: "Amit Kumar", college: "NIT Trichy", cgpa: 7.8, drive: "Wipro", status: "selected", round: "Completed" },
  { id: "4", student: "Sneha Desai", college: "BITS Pilani", cgpa: 8.9, drive: "Infosys", status: "applied", round: "Screening" },
  { id: "5", student: "Vikram Singh", college: "SRM Chennai", cgpa: 7.2, drive: "Cognizant", status: "rejected", round: "Aptitude" },
  { id: "6", student: "Ananya Reddy", college: "MIT Pune", cgpa: 8.0, drive: "TCS", status: "in-progress", round: "Managerial Round" },
  { id: "7", student: "Karthik Nair", college: "NIT Trichy", cgpa: 8.7, drive: "Accenture", status: "shortlisted", round: "Technical Assessment" },
  { id: "8", student: "Divya Menon", college: "VIT Vellore", cgpa: 9.3, drive: "Wipro", status: "selected", round: "Completed" },
];

export default function AdminApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driveFilter, setDriveFilter] = useState("all");

  const drives = [...new Set(MOCK_APPS.map(a => a.drive))];
  const filtered = MOCK_APPS.filter(a => {
    if (search && !a.student.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (driveFilter !== "all" && a.drive !== driveFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Application Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all student applications across drives.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["applied", "shortlisted", "in-progress", "selected", "rejected"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={driveFilter} onValueChange={setDriveFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Drive" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drives</SelectItem>
                {drives.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>College</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Drive</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Round</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.student}</TableCell>
                  <TableCell>{a.college}</TableCell>
                  <TableCell>{a.cgpa}</TableCell>
                  <TableCell>{a.drive}</TableCell>
                  <TableCell><Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[a.status]}`}>{a.status}</Badge></TableCell>
                  <TableCell>{a.round}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
