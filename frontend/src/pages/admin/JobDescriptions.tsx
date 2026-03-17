import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, COMPANIES, formatSalary } from "@/data/mockData";
import { Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

const JDS = [
  { id: "jd1", company: "Infosys", role: "Software Engineer", expMin: 0, expMax: 1, salMin: 350000, salMax: 500000, bond: "2 Years", location: "Bangalore", status: "active" as const },
  { id: "jd2", company: "TCS", role: "Systems Engineer", expMin: 0, expMax: 0, salMin: 300000, salMax: 450000, bond: "1 Year", location: "Mumbai", status: "active" as const },
  { id: "jd3", company: "Wipro", role: "Project Engineer", expMin: 0, expMax: 1, salMin: 380000, salMax: 480000, bond: "None", location: "Hyderabad", status: "draft" as const },
];

export default function JobDescriptionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Job Descriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage job descriptions.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New JD</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JDS.map(jd => (
                <TableRow key={jd.id}>
                  <TableCell className="font-medium">{jd.company}</TableCell>
                  <TableCell>{jd.role}</TableCell>
                  <TableCell>{jd.expMin}-{jd.expMax} yrs</TableCell>
                  <TableCell>{formatSalary(jd.salMin)} - {formatSalary(jd.salMax)}</TableCell>
                  <TableCell>{jd.location}</TableCell>
                  <TableCell><Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[jd.status]}`}>{jd.status}</Badge></TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Job Description</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Company</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>{COMPANIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Role</Label><Input placeholder="e.g. Software Engineer" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Experience Min</Label><Input type="number" placeholder="0" /></div>
              <div><Label>Experience Max</Label><Input type="number" placeholder="2" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Salary Min (₹)</Label><Input type="number" placeholder="300000" /></div>
              <div><Label>Salary Max (₹)</Label><Input type="number" placeholder="500000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Bond</Label><Input placeholder="e.g. 2 Years" /></div>
              <div><Label>Location</Label><Input placeholder="e.g. Bangalore" /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select defaultValue="draft"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("JD created!"); setDialogOpen(false); }}>Save JD</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
