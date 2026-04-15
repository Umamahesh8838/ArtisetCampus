import { useParams, useNavigate } from "react-router-dom";
import { APPLICATIONS, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Lock, XCircle } from "lucide-react";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = APPLICATIONS.find(a => a.id === id);

  if (!app) return <div className="text-center py-12 text-muted-foreground">Application not found.</div>;

  const getIcon = (status: string, result?: string) => {
    if (status === "completed" && result === "pass") return <CheckCircle2 className="h-6 w-6 text-success" />;
    if (status === "completed" && result === "fail") return <XCircle className="h-6 w-6 text-destructive" />;
    if (status === "current") return <Clock className="h-6 w-6 text-warning" />;
    return <Lock className="h-6 w-6 text-muted-foreground/40" />;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => navigate("/student/applications")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{app.company}</h1>
          <p className="text-muted-foreground">{app.role} · Applied {app.appliedDate}</p>
        </div>
        <Badge className={`text-sm capitalize border-0 ${STATUS_COLORS[app.status]}`}>{app.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Round Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            {app.rounds.map((round, i) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                {/* Vertical line */}
                <div className="flex flex-col items-center">
                  {getIcon(round.status, round.result)}
                  {i < app.rounds.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-2 ${round.status === "completed" ? "bg-success/40" : "bg-border"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className={`font-medium ${round.status === "locked" ? "text-muted-foreground/50" : "text-foreground"}`}>
                      {round.label}
                    </h4>
                    {round.result && (
                      <Badge className={`text-xs capitalize border-0 ${STATUS_COLORS[round.result]}`}>{round.result}</Badge>
                    )}
                  </div>

                  {round.score !== undefined && (
                    <p className="text-sm text-muted-foreground mt-1">Score: <strong className="text-foreground">{round.score}/{round.maxScore}</strong></p>
                  )}

                  {round.feedback && (
                    <p className="text-sm text-muted-foreground mt-1 italic">"{round.feedback}"</p>
                  )}

                  {round.status === "current" && (
                    <p className="text-xs text-warning mt-1">⏳ In Progress</p>
                  )}

                  {round.status === "locked" && (
                    <p className="text-xs text-muted-foreground/50 mt-1">🔒 Locked</p>
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
