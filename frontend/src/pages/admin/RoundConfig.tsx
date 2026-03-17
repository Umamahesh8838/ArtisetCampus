import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface RoundModule {
  module: string;
  weightage: number;
  difficulty: string;
  mandatory: boolean;
}

interface Round {
  number: number;
  label: string;
  isExam: boolean;
  modules: RoundModule[];
}

export default function RoundConfigPage() {
  const [rounds, setRounds] = useState<Round[]>([
    { number: 1, label: "Aptitude Test", isExam: true, modules: [
      { module: "DSA", weightage: 30, difficulty: "medium", mandatory: true },
      { module: "DBMS", weightage: 25, difficulty: "easy", mandatory: true },
      { module: "OOP", weightage: 25, difficulty: "medium", mandatory: false },
      { module: "Networking", weightage: 20, difficulty: "hard", mandatory: false },
    ]},
    { number: 2, label: "Technical Interview", isExam: false, modules: [] },
    { number: 3, label: "HR Interview", isExam: false, modules: [] },
  ]);

  const addRound = () => {
    setRounds([...rounds, { number: rounds.length + 1, label: "", isExam: false, modules: [] }]);
  };

  const addModule = (roundIndex: number) => {
    const updated = [...rounds];
    updated[roundIndex].modules.push({ module: "", weightage: 0, difficulty: "easy", mandatory: false });
    setRounds(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Round Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure selection rounds and exam modules.</p>
        </div>
        <Button className="gap-2" onClick={addRound}><Plus className="h-4 w-4" /> Add Round</Button>
      </div>

      <div className="space-y-4">
        {rounds.map((round, ri) => (
          <Card key={ri}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{round.number}</div>
                  <div className="flex items-center gap-3">
                    <Input value={round.label} onChange={e => { const u = [...rounds]; u[ri].label = e.target.value; setRounds(u); }} placeholder="Round name" className="w-48 h-8" />
                    <div className="flex items-center gap-2">
                      <Switch checked={round.isExam} onCheckedChange={v => { const u = [...rounds]; u[ri].isExam = v; setRounds(u); }} />
                      <span className="text-xs text-muted-foreground">Is Exam</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRounds(rounds.filter((_, i) => i !== ri))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {round.isExam && (
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5"><Settings2 className="h-4 w-4" /> Modules</h4>
                  <Button variant="outline" size="sm" onClick={() => addModule(ri)} className="gap-1"><Plus className="h-3 w-3" /> Module</Button>
                </div>

                {round.modules.map((mod, mi) => (
                  <div key={mi} className="grid grid-cols-5 gap-3 items-end p-3 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-xs">Module</Label>
                      <Select value={mod.module} onValueChange={v => { const u = [...rounds]; u[ri].modules[mi].module = v; setRounds(u); }}>
                        <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["DSA", "DBMS", "OOP", "Networking", "OS", "Programming"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Weightage %</Label>
                      <Input type="number" value={mod.weightage} onChange={e => { const u = [...rounds]; u[ri].modules[mi].weightage = +e.target.value; setRounds(u); }} className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Difficulty</Label>
                      <Select value={mod.difficulty} onValueChange={v => { const u = [...rounds]; u[ri].modules[mi].difficulty = v; setRounds(u); }}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                      <Switch checked={mod.mandatory} onCheckedChange={v => { const u = [...rounds]; u[ri].modules[mi].mandatory = v; setRounds(u); }} />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { const u = [...rounds]; u[ri].modules.splice(mi, 1); setRounds(u); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Round configuration saved!")} size="lg">Save Configuration</Button>
      </div>
    </div>
  );
}
