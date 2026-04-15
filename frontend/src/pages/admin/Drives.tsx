import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { getDrives, createDrive, updateDrive, Drive } from "@/api/drives";
import client from "@/api/client";

export default function RecruitmentDrives() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [jds, setJds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form state
  const initialDriveState = {
    jd_id: "",
    drive_name: "",
    start_date: "",
    end_date: "",
    status: "Draft"
  };

  const [newDrive, setNewDrive] = useState(initialDriveState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivesRes, jdsRes] = await Promise.all([
        getDrives(),
        client.get('/jds')
      ]);
      setDrives(drivesRes.data.drives || []);
      setJds(jdsRes.data.jds || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!newDrive.jd_id || !newDrive.drive_name || !newDrive.start_date || !newDrive.end_date) {
      toast.error("Please fill in all required fields (JD, Name, Start, End Dates)");
      return;
    }

    try {
      setSubmitting(true);
      if (editId) {
        await updateDrive(editId, {
          ...newDrive,
          jd_id: parseInt(newDrive.jd_id)
        });
        toast.success("Drive updated successfully!");
      } else {
        await createDrive({
          ...newDrive,
          jd_id: parseInt(newDrive.jd_id)
        });
        toast.success("Drive created successfully!");
      }
      
      setDialogOpen(false);
      setNewDrive(initialDriveState);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save drive");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (d: Drive) => {
    setEditId(d.drive_id);
    setNewDrive({
      jd_id: d.jd_id?.toString() || "",
      drive_name: d.drive_name || "",
      start_date: d.drive_start_date ? d.drive_start_date.split('T')[0] : "",
      end_date: d.drive_end_date ? d.drive_end_date.split('T')[0] : "",
      status: d.status || "Draft"
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500';
      case 'Closed': return 'bg-rose-500/10 text-rose-500';
      case 'Archived': return 'bg-slate-500/10 text-slate-500';
      default: return 'bg-amber-500/10 text-amber-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Recruitment Drives</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage recruitment drives mapped to Job Descriptions.</p>
        </div>
        <Button className="gap-2" onClick={() => {
           setEditId(null);
           setNewDrive(initialDriveState);
           setDialogOpen(true);
        }}><Plus className="h-4 w-4" /> New Drive</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drive Name</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : drives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No drives found.
                  </TableCell>
                </TableRow>
              ) : (
                drives.map((d: Drive) => (
                  <TableRow key={d.drive_id}>
                    <TableCell className="font-medium">{d.drive_name}</TableCell>
                    <TableCell>{d.jd_title || `JD: ${d.jd_id}`}</TableCell>
                    <TableCell>{d.company_name || 'N/A'}</TableCell>
                    <TableCell>{new Date(d.drive_start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(d.drive_end_date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className={`text-xs capitalize border-0 ${getStatusColor(d.status)}`}>{d.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => (window.location.href = `/admin/rounds/${d.drive_id}`)}>
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Recruitment Drive" : "Create Recruitment Drive"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Job Description</Label>
              <Select value={newDrive.jd_id} onValueChange={(val) => setNewDrive({ ...newDrive, jd_id: val })}>
                <SelectTrigger><SelectValue placeholder="Select Job Description" /></SelectTrigger>
                <SelectContent>
                  {jds.map((j: any) => (
                    <SelectItem key={j.jd_id} value={j.jd_id.toString()}>
                      {j.company_name} - {j.title} ({j.job_role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Drive Name</Label>
              <Input placeholder="e.g. Infosys Campus 2026" value={newDrive.drive_name} onChange={(e) => setNewDrive({ ...newDrive, drive_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={newDrive.start_date} onChange={(e) => setNewDrive({ ...newDrive, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={newDrive.end_date} onChange={(e) => setNewDrive({ ...newDrive, end_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newDrive.status} onValueChange={(val) => setNewDrive({ ...newDrive, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editId ? "Update Drive" : "Save Drive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
