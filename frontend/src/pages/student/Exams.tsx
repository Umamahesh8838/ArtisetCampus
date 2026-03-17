import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAM_QUESTIONS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Phase = "intro" | "exam" | "result";

export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min

  useEffect(() => {
    if (phase !== "exam") return;
    const t = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) { clearInterval(t); setPhase("result"); return 0; }
      return prev - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const q = EXAM_QUESTIONS[current];
  const total = EXAM_QUESTIONS.length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const score = EXAM_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.correct ? q.marks : 0), 0);
  const maxScore = EXAM_QUESTIONS.reduce((acc, q) => acc + q.marks, 0);
  const correctCount = EXAM_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
  const cutoff = 50;
  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= cutoff;

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-foreground">Aptitude Examination</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-foreground">Infosys - Aptitude Test</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted"><span className="text-muted-foreground">Questions:</span> <strong>{total}</strong></div>
              <div className="p-3 rounded-lg bg-muted"><span className="text-muted-foreground">Duration:</span> <strong>30 min</strong></div>
              <div className="p-3 rounded-lg bg-muted"><span className="text-muted-foreground">Total Marks:</span> <strong>{maxScore}</strong></div>
              <div className="p-3 rounded-lg bg-muted"><span className="text-muted-foreground">Cutoff:</span> <strong>{cutoff}%</strong></div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Do not switch tabs during the exam</li>
              <li>• No negative marking</li>
              <li>• Submit before the timer runs out</li>
            </ul>
            <Button className="w-full" size="lg" onClick={() => setPhase("exam")}>Start Exam</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-foreground">Exam Results</h1>
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className={cn("h-24 w-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold", passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {percentage}%
            </div>
            <Badge className={`text-base border-0 ${passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {passed ? "PASSED" : "FAILED"}
            </Badge>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-foreground">{score}/{maxScore}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-success">{correctCount}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-destructive">{total - correctCount}</p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Cutoff: {cutoff}%</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Exam Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border -m-4 md:-m-6 p-4 md:px-6 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Question {current + 1}/{total}</span>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={cn("text-sm font-mono font-bold", timeLeft < 300 ? "text-destructive" : "text-foreground")}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 pt-2">
        {/* Question navigator */}
        <Card className="h-fit">
          <CardContent className="p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {EXAM_QUESTIONS.map((eq, i) => (
                <button
                  key={eq.id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                    i === current ? "bg-primary text-primary-foreground" : answers[eq.id] !== undefined ? "bg-success/10 text-success" : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question area */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{q.module} · {q.difficulty} · {q.marks} marks</Badge>
            </div>
            <h3 className="text-lg font-medium text-foreground">{q.text}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors text-sm",
                    answers[q.id] === i
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:border-primary/30 hover:bg-accent/30 text-muted-foreground"
                  )}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        {current === total - 1 ? (
          <Button onClick={() => setPhase("result")}>Submit Exam</Button>
        ) : (
          <Button onClick={() => setCurrent(current + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
