import { useParams, useNavigate } from "react-router-dom";
import { STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Lock, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getApplicationById } from "@/api/applications";
import { toast } from "sonner";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await getApplicationById(id);
        const application = res.data.application || res.data;
        setApp(application || null);
        setHistory(Array.isArray(res.data.history) ? res.data.history : []);
      } catch (err: any) {
        toast.error("Failed to fetch application details");
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!app) return <div className="text-center py-12 text-muted-foreground">Application not found.</div>;

  const getIcon = (status: string, result?: string) => {
    const normalizedStatus = String(status || "").toLowerCase();
    const normalizedResult = String(result || "").toLowerCase();
    if (normalizedStatus === "completed" && normalizedResult === "fail") return <XCircle className="h-6 w-6 text-destructive" />;
    if (normalizedStatus === "completed") return <CheckCircle2 className="h-6 w-6 text-success" />;
    if (normalizedStatus === "current") return <Clock className="h-6 w-6 text-warning" />;
    return <Lock className="h-6 w-6 text-muted-foreground/40" />;
  };

  const rounds = Array.isArray(app.rounds) ? app.rounds : history.map((h: any, index: number) => ({
    round_number: index + 1,
    round_name: h.status,
    status: index === history.length - 1 ? "current" : "completed",
    result: undefined,
    changed_date: h.changed_date,
  }));
  const badgeKey = String(app.status || "").toLowerCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => navigate("/student/applications")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{app.company_name || app.company || "Unknown Company"}</h1>
          <p className="text-muted-foreground">{(app as any).job_role || (app as any).jd_title || (app as any).job_title || app.role || app.drive_name || "Role"} · Applied {new Date(app.applied_date || app.application_date || app.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
        <Badge className={`text-sm capitalize border-0 ${STATUS_COLORS[badgeKey as keyof typeof STATUS_COLORS] || ""}`}>{app.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Round Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            {rounds.map((round: any, i: number) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  {getIcon(round.status, round.result)}
                  {i < rounds.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-2 ${(round.status === "completed" || round.status === "passed") ? "bg-success/40" : "bg-border"}`} />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className={`font-medium ${round.status === "locked" ? "text-muted-foreground/50" : "text-foreground"}`}>
                      {round.label || round.round_name || `Round ${round.round_number || i + 1}`}
                    </h4>
                    {round.result && (
                      <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[String(round.result).toLowerCase() as keyof typeof STATUS_COLORS] || ""}`}>{round.result}</Badge>
                    )}
                  </div>

                  {round.score !== undefined && round.score !== null && (
                    <p className="text-sm text-muted-foreground mt-1">Score: <strong className="text-foreground">{round.score}/{round.maxScore || 100}</strong></p>
                  )}

                  {round.feedback && (
                    <p className="text-sm text-muted-foreground mt-1 italic">"{round.feedback}"</p>
                  )}

                  {round.changed_date && (
                    <p className="text-xs text-muted-foreground mt-1">{new Date(round.changed_date).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
