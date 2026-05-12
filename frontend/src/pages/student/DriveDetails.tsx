import { useParams, useNavigate } from "react-router-dom";
import { formatSalary, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Users, Briefcase, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDriveById, Drive as BackendDrive } from "@/api/drives";
import { applyToDrive } from "@/api/applications";
import client from "@/api/client";
import { getMyApplications } from "@/api/applications";
import { useAuth } from "@/hooks/useAuth";

export default function DriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);
  const [drive, setDrive] = useState<BackendDrive | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const { token } = useAuth();

  const calculateProfileCompletionFromDraft = (draft: any): number => {
    const sectionKeys = [
      "basic",
      "address",
      "school",
      "college",
      "semesters",
      "work",
      "projects",
      "skills",
      "languages",
      "interests",
      "certifications",
    ];

    const sectionCompletion: Record<string, number> = Object.fromEntries(
      sectionKeys.map((key) => [key, 0])
    );

    if (!draft || typeof draft !== "object") {
      return 0;
    }

    for (const key of Object.keys(draft)) {
      if (!(key in sectionCompletion)) {
        continue;
      }

      const val = draft[key];
      if (Array.isArray(val)) {
        if (val.length > 0) sectionCompletion[key] = 100;
      } else if (val && typeof val === "object") {
        if (Object.values(val).some((v) => v !== null && v !== "")) {
          sectionCompletion[key] = 100;
        }
      } else if (val) {
        sectionCompletion[key] = 100;
      }
    }

    const values = Object.values(sectionCompletion);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);

        // Fetch drive, draft and applications in parallel to reduce load time
        const [driveRes, draftRes, appsRes] = await Promise.all([
          getDriveById(id),
          client.get('/auth/registration/draft').catch(() => ({ data: { draft: {} } })),
          getMyApplications().catch(() => ({ data: { applications: [] } })),
        ]);

        const driveObj = driveRes.data.drive || {};
        const jd = driveRes.data.jd || {};
        const rounds = driveRes.data.rounds || [];
        setDrive({ ...driveObj, ...jd, rounds, requirements: jd.requirements || jd.requirement_list || driveObj.requirements || [] });

        const draft = draftRes?.data?.draft || {};
        const completion = calculateProfileCompletionFromDraft(draft);
        setProfileCompletion(completion);

        const myApps = appsRes?.data?.applications || [];
        const applied = myApps.some((a: any) => Number(a.drive_id) === Number(id));
        setAlreadyApplied(Boolean(applied));
      } catch (err: any) {
        toast.error("Failed to fetch drive details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!drive) return <div className="text-center py-12 text-muted-foreground">Drive not found.</div>;

  const eligibility = [
    { label: "Degree Requirement", met: true },
    { label: "Minimum Aggregate", met: true },
    { label: "No Active Backlogs", met: true },
    { label: "Profile Completion > 80%", met: profileCompletion > 80, value: `${profileCompletion}%` },
  ];

  const allEligible = eligibility.every(e => e.met);

  const handleApply = async () => {
    try {
      setApplying(true);
      await applyToDrive({ drive_id: drive.drive_id, jd_id: drive.jd_id });
      toast.success(`Successfully applied to ${drive.company_name || drive.drive_name}!`);
      setAlreadyApplied(true);
      setApplyOpen(false);
      navigate("/student/applications");
    } catch(err: any) {
      const message = err?.message || "Failed to apply";
      if (message.toLowerCase().includes('already applied')) {
        setAlreadyApplied(true);
        setApplyOpen(false);
        toast.info('You have already applied to this drive.');
      } else {
        toast.error(message);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <button onClick={() => navigate("/student/drives")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Drives
      </button>

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-3xl text-primary shrink-0">
            {(drive.drive_name || '').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">{drive.company_name || drive.drive_name}</h1>
                <p className="text-muted-foreground text-sm mt-1">{drive.jd_title || "General Recruitment"}</p>
              </div>
              <Badge className={`text-xs capitalize border-0 px-3 py-1 ${STATUS_COLORS[drive.status as keyof typeof STATUS_COLORS] || ""}`}>
                {drive.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex items-start gap-4">
            <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">Location</p>
              <p className="font-medium text-foreground text-sm break-words">{drive.location || "Multiple Locations"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex items-start gap-4">
            <Briefcase className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">Salary Range</p>
              <p className="font-medium text-foreground text-sm">
                {drive.salary_min && drive.salary_max 
                  ? `${formatSalary(Number(drive.salary_min))} - ${formatSalary(Number(drive.salary_max))}` 
                  : "Competitive"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex items-start gap-4">
            <Users className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">Openings</p>
              <p className="font-medium text-foreground text-sm">{drive.openings || "TBA"} positions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About the Role */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">About the Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{drive.description}</p>
          
          {(drive.requirements || []).length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Requirements</h4>
              <ul className="space-y-2">
                {(drive.requirements || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> 
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-muted/40 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {drive.experience && (
                <div>
                  <span className="text-muted-foreground text-xs font-medium">Experience Required</span>
                  <p className="font-medium text-foreground mt-1">{drive.experience}</p>
                </div>
              )}
              {drive.bond && (
                <div>
                  <span className="text-muted-foreground text-xs font-medium">Bond Period</span>
                  <p className="font-medium text-foreground mt-1">{drive.bond}</p>
                </div>
              )}
              {!drive.bond && Number(drive.bond_months) > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs font-medium">Bond Period</span>
                  <p className="font-medium text-foreground mt-1">{drive.bond_months} months</p>
                </div>
              )}
              {drive.deadline && (
                <div>
                  <span className="text-muted-foreground text-xs font-medium">Deadline</span>
                  <p className="font-medium text-foreground mt-1">{drive.deadline}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Rounds */}
      {(drive.rounds || []).length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Selection Process</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {(drive.rounds || []).map((round, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 mt-0.5">
                    {typeof round.number === 'number' ? `R${round.number}` : round.number}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{round.label}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {round.number === 0 ? 'Pre-event / Eligibility' : `Round ${round.number} — ${(round.type || "").replace("-", " ")}`}
                    </p>
                    {(round?.config?.scheduledDate || round?.config?.original?.scheduledDate) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(round.config?.scheduledDate || round.config?.original?.scheduledDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Button */}
      <div className="flex justify-end pt-4">
        <Button 
          size="lg" 
          disabled={String(drive.status).toLowerCase() !== 'active' || alreadyApplied} 
          onClick={() => setApplyOpen(true)}
          variant={alreadyApplied ? "outline" : "default"}
          className={alreadyApplied ? "min-w-fit border-muted-foreground/40 text-muted-foreground" : "min-w-fit"}
        >
          {alreadyApplied
            ? 'Already applied'
            : String(drive.status).toLowerCase() === 'active'
              ? 'Apply Now'
              : 'Applications Closed'}
        </Button>
      </div>

      {/* Application Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {drive.company_name || drive.drive_name || "this drive"}</DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Please review your eligibility before submitting your application.
            </DialogDescription>
          </DialogHeader>

          {/* Eligibility Checklist */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 my-4">
            <h4 className="font-medium text-sm text-foreground mb-3">Eligibility Requirements</h4>
            {eligibility.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                {e.met ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm block ${e.met ? "text-foreground" : "text-yellow-900"}`}>
                    {e.label}
                  </span>
                  {(e as any).value && (
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      Current: {(e as any).value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!allEligible && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-medium mb-1">⚠️ Profile Incomplete</p>
              <p>Please complete your profile to at least 80% before applying.</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!allEligible || applying || alreadyApplied}
              variant={alreadyApplied ? "outline" : "default"}
            >
              {alreadyApplied ? "Already applied" : applying ? "Applying..." : allEligible ? "Confirm Application" : "Complete Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
