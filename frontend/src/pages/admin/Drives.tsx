import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS } from "@/data/mockData";
import { Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

const MOCK_DRIVES = [
  { id: "rd1", name: "Infosys Campus 2026", jd: "Software Engineer", start: "2026-03-01", end: "2026-03-15", status: "open" as const },
  { id: "rd2", name: "TCS Ninja 2026", jd: "Systems Engineer", start: "2026-03-10", end: "2026-03-20", status: "open" as const },
  { id: "rd3", name: "Wipro Elite 2026", jd: "Project Engineer", start: "2026-04-01", end: "2026-04-15", status: "upcoming" as const },
  { id: "rd4", name: "HCL GET 2026", jd: "Graduate Engineer Trainee", start: "2026-02-01", end: "2026-02-28", status: "closed" as const },
];

export default function RecruitmentDrives() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Recruitment Drives</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage recruitment drives.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Drive</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drive Name</TableHead>
                <TableHead>Job Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DRIVES.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.jd}</TableCell>
                  <TableCell>{d.start}</TableCell>
                  <TableCell>{d.end}</TableCell>
                  <TableCell><Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[d.status]}`}>{d.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Recruitment Drive</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Drive Name</Label><Input placeholder="e.g. Infosys Campus 2026" /></div>
            <div>
              <Label>Job Description</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select JD" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jd1">Infosys - Software Engineer</SelectItem>
                  <SelectItem value="jd2">TCS - Systems Engineer</SelectItem>
                  <SelectItem value="jd3">Wipro - Project Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" /></div>
              <div><Label>End Date</Label><Input type="date" /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select defaultValue="upcoming"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Drive created!"); setDialogOpen(false); }}>Save Drive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
