import { useState } from "react";
import { ADMIN_QUESTIONS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function QuestionBankPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage exam questions across modules.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Add Question</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ADMIN_QUESTIONS.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium max-w-xs truncate">{q.text}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{q.module}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs capitalize border-0 ${q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>{q.difficulty}</Badge></TableCell>
                  <TableCell className="capitalize">{q.type}</TableCell>
                  <TableCell>{q.marks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Module</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["DSA", "DBMS", "OOP", "Networking", "OS", "Programming"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="subjective">Subjective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Max Marks</Label><Input type="number" placeholder="5" /></div>
            <div><Label>Question Text</Label><Textarea placeholder="Enter question..." rows={3} /></div>
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={opt} onChange={e => { const u = [...options]; u[i] = e.target.value; setOptions(u); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={correctIdx === i} onCheckedChange={() => setCorrectIdx(i)} />
                    <span className="text-xs text-muted-foreground">Correct</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setOptions([...options, ""])} className="gap-1"><Plus className="h-3 w-3" /> Add Option</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Question added!"); setDialogOpen(false); }}>Save Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
