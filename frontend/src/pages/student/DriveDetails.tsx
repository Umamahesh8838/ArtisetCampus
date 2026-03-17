import { useParams, useNavigate } from "react-router-dom";
import { DRIVES, formatSalary, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);
  const drive = DRIVES.find(d => d.id === id);

  if (!drive) return <div className="text-center py-12 text-muted-foreground">Drive not found.</div>;

  const eligibility = [
    { label: "Degree Requirement", met: true },
    { label: "Minimum Aggregate", met: true },
    { label: "No Active Backlogs", met: true },
    { label: "Profile Completion > 80%", met: false },
  ];

  const allEligible = eligibility.every(e => e.met);

  const handleApply = () => {
    toast.success(`Successfully applied to ${drive.company}!`);
    setApplyOpen(false);
    navigate("/student/applications");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate("/student/drives")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Drives
      </button>

      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-2xl text-primary shrink-0">{drive.logo}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{drive.company}</h1>
              <p className="text-muted-foreground">{drive.role}</p>
            </div>
            <Badge className={`text-sm capitalize border-0 ${STATUS_COLORS[drive.status]}`}>{drive.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium text-foreground">{drive.location}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium text-foreground">{formatSalary(drive.salaryMin)} - {formatSalary(drive.salaryMax)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Openings</p><p className="font-medium text-foreground">{drive.openings} positions</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>About the Role</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{drive.description}</p>
          <div>
            <h4 className="font-medium text-foreground mb-2">Requirements</h4>
            <ul className="space-y-1">
              {drive.requirements.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Experience: <strong className="text-foreground">{drive.experience}</strong></span>
            <span className="text-muted-foreground">Bond: <strong className="text-foreground">{drive.bond}</strong></span>
            <span className="text-muted-foreground">Deadline: <strong className="text-foreground">{drive.deadline}</strong></span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Selection Rounds</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {drive.rounds.map((round, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{round.number}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{round.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{round.type.replace("-", " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={drive.status !== "open"} onClick={() => setApplyOpen(true)}>
          {drive.status === "open" ? "Apply Now" : "Applications Closed"}
        </Button>
      </div>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {drive.company}</DialogTitle>
            <DialogDescription>Please review eligibility before applying.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {eligibility.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                {e.met ? <CheckCircle2 className="h-5 w-5 text-success" /> : <AlertCircle className="h-5 w-5 text-warning" />}
                <span className={`text-sm ${e.met ? "text-foreground" : "text-warning"}`}>{e.label}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={!allEligible}>
              {allEligible ? "Confirm Application" : "Complete Profile First"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
