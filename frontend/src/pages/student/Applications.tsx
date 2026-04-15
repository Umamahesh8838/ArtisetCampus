import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { getMyApplications, Application } from "@/api/applications";
import { getDrives, Drive } from "@/api/drives";
import { STATUS_COLORS } from "@/data/mockData";
import { toast } from "sonner";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, drivesRes] = await Promise.all([
        getMyApplications(),
        getDrives()
      ]);
      setApplications(appsRes.data.applications);
      setDrives(drivesRes.data.drives);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground text-sm mt-1">Track the status of your job applications.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drive / Company</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Round</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    You haven't applied to any drives yet.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app: any) => (
                  <TableRow key={app.application_id} className="cursor-pointer hover:bg-accent/30" onClick={() => navigate(`/student/applications/${app.application_id}`)}>
                    <TableCell className="font-medium">
                      {app.drive_name || "N/A"}
                    </TableCell>
                    <TableCell>{new Date(app.applied_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] || ""}`}>{app.status}</Badge>
                    </TableCell>
                    <TableCell>{app.current_round || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

