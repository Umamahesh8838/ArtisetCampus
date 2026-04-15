import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, formatSalary } from "@/data/mockData";
import { Plus, Edit2, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import client from "@/api/client";

export default function JobDescriptionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const initialFormState = {
    company_id: "",
    job_role: "",
    title: "",
    description: "",
    experience_min_yrs: "",
    experience_max_yrs: "",
    salary_min: "",
    salary_max: "",
    bond_months: "0",
    location: "",
    employment_type: "Full-Time",
    openings: "1",
    hiring_manager_name: "",
    hiring_manager_email: "",
    status: "Open"
  };

  const [formData, setFormData] = useState(initialFormState);

  const { data: jdsData, loading, refetch: refetchJDs } = useApi<{ jds: any[] }>(
    () => client.get('/jds')
  );

  const { data: companiesData } = useApi<{ companies: any[] }>(
    () => client.get('/companies')
  );

  const jds = jdsData?.jds || [];
  const companies = companiesData?.companies || [];

  const handleSave = async () => {
    try {
      if (!formData.company_id || !formData.job_role || !formData.title) {
        toast.error("Company, Job Role, and Title are required");
        return;
      }
      
      const payload = {
        ...formData,
        experience_min_yrs: parseFloat(formData.experience_min_yrs) || 0,
        experience_max_yrs: parseFloat(formData.experience_max_yrs) || 0,
        salary_min: parseFloat(formData.salary_min) || 0,
        salary_max: parseFloat(formData.salary_max) || 0,
        bond_months: parseInt(formData.bond_months, 10) || 0,
        openings: parseInt(formData.openings, 10) || 1
      };

      if (editId) {
        await client.put(`/jds/${editId}`, payload);
        toast.success("JD updated successfully!");
      } else {
        await client.post('/jds', payload);
        toast.success("JD created successfully!");
      }
      
      setDialogOpen(false);
      setFormData(initialFormState);
      refetchJDs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save JD");
    }
  };
  
  const openEdit = (jd: any) => {
    setEditId(jd.jd_id);
    setFormData({
      company_id: jd.company_id?.toString() || "",
      job_role: jd.job_role || "",
      title: jd.title || "",
      description: jd.description || "",
      experience_min_yrs: jd.experience_min_yrs?.toString() || "0",
      experience_max_yrs: jd.experience_max_yrs?.toString() || "0",
      salary_min: jd.salary_min?.toString() || "0",
      salary_max: jd.salary_max?.toString() || "0",
      bond_months: jd.bond_months?.toString() || "0",
      location: jd.location || "",
      employment_type: jd.employment_type || "Full-Time",
      openings: jd.openings?.toString() || "1",
      hiring_manager_name: jd.hiring_manager_name || "",
      hiring_manager_email: jd.hiring_manager_email || "",
      status: jd.status || "Open"
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Job Descriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage job descriptions.</p>
        </div>
        <Button className="gap-2" onClick={() => {
           setEditId(null);
           setFormData(initialFormState);
           setDialogOpen(true);
        }}><Plus className="h-4 w-4" /> New JD</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : jds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No job descriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                jds.map(jd => (
                  <TableRow key={jd.jd_id}>
                    <TableCell className="font-medium">{jd.company_name}</TableCell>
                    <TableCell>{jd.title}</TableCell>
                    <TableCell>{jd.job_role}</TableCell>
                    <TableCell>{formatSalary(jd.salary_min)} - {formatSalary(jd.salary_max)}</TableCell>
                    <TableCell>{jd.location || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize border-0 ${jd.status === 'Open' ? STATUS_COLORS.active : STATUS_COLORS.inactive}`}>
                        {jd.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => window.location.href=`/admin/rounds/${jd.jd_id}`} title="Configure Rounds">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(jd)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Job Description" : "Create Job Description"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Select value={formData.company_id} onValueChange={val => setFormData({...formData, company_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c.company_id} value={c.company_id.toString()}>{c.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Job Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. SDE-1" /></div>
              <div><Label>Job Role</Label><Input value={formData.job_role} onChange={e => setFormData({...formData, job_role: e.target.value})} placeholder="e.g. Software Engineer" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Exp Min (Yrs)</Label><Input type="number" step="0.5" value={formData.experience_min_yrs} onChange={e => setFormData({...formData, experience_min_yrs: e.target.value})} placeholder="0" /></div>
              <div><Label>Exp Max (Yrs)</Label><Input type="number" step="0.5" value={formData.experience_max_yrs} onChange={e => setFormData({...formData, experience_max_yrs: e.target.value})} placeholder="2" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Salary Min (₹)</Label><Input type="number" value={formData.salary_min} onChange={e => setFormData({...formData, salary_min: e.target.value})} placeholder="300000" /></div>
              <div><Label>Salary Max (₹)</Label><Input type="number" value={formData.salary_max} onChange={e => setFormData({...formData, salary_max: e.target.value})} placeholder="500000" /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
               <div><Label>Bond (Months)</Label><Input type="number" value={formData.bond_months} onChange={e => setFormData({...formData, bond_months: e.target.value})} placeholder="0" /></div>
               <div><Label>Openings</Label><Input type="number" value={formData.openings} onChange={e => setFormData({...formData, openings: e.target.value})} placeholder="1" /></div>
               <div>
                  <Label>Job Type</Label>
                  <Select value={formData.employment_type} onValueChange={val => setFormData({...formData, employment_type: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>        
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div><Label>Hiring Mgr Name</Label><Input value={formData.hiring_manager_name} onChange={e => setFormData({...formData, hiring_manager_name: e.target.value})} placeholder="Name" /></div>
               <div><Label>Hiring Mgr Email</Label><Input value={formData.hiring_manager_email} onChange={e => setFormData({...formData, hiring_manager_email: e.target.value})} placeholder="email@ext.com" /></div>
            </div>

            <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Bangalore" /></div>
            
            <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Job description summary..." /></div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Update JD" : "Save JD"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
