import { useState } from "react";
import { COMPANIES, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function CompaniesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage recruiting companies.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Add Company</Button>
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
              {COMPANIES.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.industry}</TableCell>
                  <TableCell>{c.contactPerson}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell><Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[c.status]}`}>{c.status}</Badge></TableCell>
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
          <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Company Name</Label><Input placeholder="e.g. Google" /></div>
            <div><Label>Industry</Label><Input placeholder="e.g. Technology" /></div>
            <div><Label>Website</Label><Input placeholder="e.g. google.com" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact Person</Label><Input placeholder="Name" /></div>
              <div><Label>Email</Label><Input placeholder="email@company.com" /></div>
            </div>
            <div><Label>Phone</Label><Input placeholder="Phone number" /></div>
            <div>
              <Label>Status</Label>
              <Select defaultValue="active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Company added!"); setDialogOpen(false); }}>Save Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
