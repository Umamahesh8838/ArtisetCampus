import { INTERVIEWS, STATUS_COLORS } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Video, Calendar, Clock, User, Star, MessageSquare } from "lucide-react";

export default function InterviewsPage() {
  const scheduled = INTERVIEWS.filter(i => i.status === "scheduled");
  const completed = INTERVIEWS.filter(i => i.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Interviews</h1>
        <p className="text-muted-foreground text-sm mt-1">View upcoming and past interview sessions.</p>
      </div>

      {scheduled.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg text-foreground">Upcoming</h2>
          {scheduled.map(interview => (
            <Card key={interview.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{interview.company} - {interview.roundName}</h3>
                    <p className="text-sm text-muted-foreground">{interview.role}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {interview.interviewer}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {interview.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {interview.time}</span>
                    </div>
                  </div>
                  <Button className="gap-2"><Video className="h-4 w-4" /> Join Interview</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg text-foreground">Completed</h2>
          {completed.map(interview => (
            <Card key={interview.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{interview.company} - {interview.roundName}</h3>
                    <p className="text-sm text-muted-foreground">{interview.role} · {interview.date}</p>
                  </div>
                  <Badge className={`text-sm capitalize border-0 ${STATUS_COLORS[interview.result || "completed"]}`}>
                    {interview.result || "Completed"}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-bold text-foreground">{interview.score}</p>
                    <p className="text-xs text-muted-foreground">Total Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-bold text-foreground">+{interview.bonus}</p>
                    <p className="text-xs text-muted-foreground">Bonus Marks</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-bold text-foreground capitalize">{interview.result}</p>
                    <p className="text-xs text-muted-foreground">Result</p>
                  </div>
                </div>

                {interview.comments && (
                  <div className="p-3 rounded-lg bg-accent/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Feedback</p>
                    <p className="text-sm text-foreground">{interview.comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
