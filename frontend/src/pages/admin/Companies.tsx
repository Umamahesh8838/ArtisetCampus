import { useState, useEffect } from "react";
import { STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { companiesAPI } from "@/api/companies";
import { useApi } from "@/hooks/useApi";

export default function CompaniesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    website: "",
    spoc_name: "",
    spoc_email: "",
    spoc_phone: ""
  });

  const { data, loading, error, refetch } = useApi<{ companies: any[]; total: number }>(
    () => companiesAPI.getCompanies(50, 0, true)
  );

  const handleSave = async () => {
    try {
      if (!formData.company_name || !formData.spoc_email) {
        toast.error("Company name and SPOC email are required");
        return;
      }
      
      if (editId) {
        await companiesAPI.updateCompany(editId, formData as any);
        toast.success("Company updated successfully!");
      } else {
        await companiesAPI.createCompany(formData as any);
        toast.success("Company added successfully!");
      }
      
      setDialogOpen(false);
      setFormData({ company_name: "", industry: "", website: "", spoc_name: "", spoc_email: "", spoc_phone: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save company");
    }
  };

  const companies = data?.companies || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage recruiting companies.</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditId(null);
          setFormData({ company_name: "", industry: "", website: "", spoc_name: "", spoc_email: "", spoc_phone: "" });
          setDialogOpen(true);
        }}><Plus className="h-4 w-4" /> Add Company</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No companies found.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((c: any) => (
                  <TableRow key={c.company_id}>
                    <TableCell className="font-medium">{c.company_name}</TableCell>
                    <TableCell>{c.industry || "N/A"}</TableCell>
                    <TableCell>{c.spoc_name || "N/A"}</TableCell>
                    <TableCell>{c.spoc_email}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize border-0 ${c.is_active ? STATUS_COLORS.active : STATUS_COLORS.inactive}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditId(c.company_id);
                        setFormData({
                          company_name: c.company_name || "",
                          industry: c.industry || "",
                          website: c.website || "",
                          spoc_name: c.spoc_name || "",
                          spoc_email: c.spoc_email || "",
                          spoc_phone: c.spoc_phone || ""
                        });
                        setDialogOpen(true);
                      }}>
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
          <DialogHeader><DialogTitle>{editId ? "Edit Company" : "Add Company"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Company Name</Label><Input value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="e.g. Google" /></div>
            <div><Label>Industry</Label><Input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Technology" /></div>
            <div><Label>Website</Label><Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="e.g. google.com" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact Person</Label><Input value={formData.spoc_name} onChange={e => setFormData({...formData, spoc_name: e.target.value})} placeholder="Name" /></div>
              <div><Label>Email</Label><Input value={formData.spoc_email} onChange={e => setFormData({...formData, spoc_email: e.target.value})} placeholder="email@company.com" /></div>
            </div>
            <div><Label>Phone</Label><Input value={formData.spoc_phone} onChange={e => setFormData({...formData, spoc_phone: e.target.value})} placeholder="Phone number" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Update Company" : "Save Company"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
