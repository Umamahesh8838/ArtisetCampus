import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, History, Edit2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import client from "@/api/client";
import { toast } from "sonner";

export default function AdminApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Changed from /applications/admin/all to /applications matching applicationRoutes-new.js
  const { data, loading, refetch } = useApi<{ applications: any[]; total: number }>(
    () => client.get('/applications', { params: { status: statusFilter !== 'all' ? statusFilter : undefined } }),
    [statusFilter]
  );

  const applications = data?.applications || [];

  const filtered = applications.filter(a => {
    if (search && !(`${a.first_name} ${a.last_name}`).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-indigo-100 text-indigo-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setUpdatingId(applicationId);
      await client.patch(`/applications/${applicationId}/status`, { status: newStatus });
      toast.success("Application status updated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const viewHistory = async (applicationId: number) => {
    try {
      setHistoryOpen(true);
      setHistoryLoading(true);
      const res = await client.get(`/applications/${applicationId}/history`);
      setHistoryLogs(res.data.history || []);
    } catch (err: any) {
      toast.error("Failed to load application history");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Application Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">Track student applications and manage status progression.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search student..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>       
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Drive / Job</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(a => (
                  <TableRow key={a.application_id}>
                    <TableCell className="font-medium">
                      {a.first_name} {a.last_name}
                      <span className="block text-xs text-muted-foreground mt-0.5">{a.email}</span>
                    </TableCell>
                    <TableCell>
                      {a.drive_name || "N/A"}
                      <span className="block text-xs font-semibold text-muted-foreground mt-0.5">{a.job_title}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(a.application_date || a.applied_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {updatingId === a.application_id ? (
                        <div className="flex items-center gap-2">
                           <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        </div>
                      ) : (
                        <Select 
                          value={a.status} 
                          onValueChange={(val) => handleStatusChange(a.application_id, val)}
                        >
                          <SelectTrigger className={`h-7 text-xs w-[120px] border-0 font-medium ${getStatusColor(a.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewHistory(a.application_id)} title="View History" className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <History className="h-4 w-4 mr-1" /> History
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              Application Status History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {historyLoading ? (
               <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : historyLogs.length === 0 ? (
               <p className="text-sm text-center text-muted-foreground p-4">No history records found.</p>
            ) : (
               <div className="pl-4 border-l-2 border-indigo-100 space-y-6 relative">
                 {historyLogs.map((log, index) => (
                    <div key={log.history_id || index} className="relative">
                       <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold capitalize text-foreground flex items-center gap-2">
                             Changed to: <Badge variant="outline" className={getStatusColor(log.status)}>{log.status}</Badge>
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                             {new Date(log.changed_date).toLocaleString()}
                          </span>
                       </div>
                    </div>
                 ))}
               </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}