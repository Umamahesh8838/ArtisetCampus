import { APPLICATIONS, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

export default function MyApplications() {
  const navigate = useNavigate();

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
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Round</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {APPLICATIONS.map(app => {
                const currentRoundInfo = app.rounds.find(r => r.status === "current");
                return (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-accent/30" onClick={() => navigate(`/student/applications/${app.id}`)}>
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>{app.appliedDate}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[app.status]}`}>{app.status}</Badge>
                    </TableCell>
                    <TableCell>{currentRoundInfo?.label || "Completed"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
