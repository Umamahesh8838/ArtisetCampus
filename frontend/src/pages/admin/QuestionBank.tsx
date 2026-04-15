import { useState } from "react";
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
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import client from "@/api/client";

export default function QuestionBankPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  
  const defaultFormData = {
    module_id: "",
    question_text: "",
    question_type: "mcq",
    difficulty_id: "",
    max_marks: 1.0,
    correct_answer: "",
    options: [
      { text: "", is_correct: true },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false }
    ]
  };

  const [formData, setFormData] = useState(defaultFormData);

  const { data: questionsData, loading, refetch: refetchQuestions } = useApi<{ questions: any[] }>(
    () => client.get(`/questions${filterModule !== "all" ? `?module_id=${filterModule}` : ""}`),
    [filterModule]
  );

  const { data: modulesData } = useApi<{ modules: any[] }>(
    () => client.get('/questions/modules')
  );

  const { data: difficultiesData } = useApi<{ difficulties: any[] }>(
    () => client.get('/questions/difficulties')
  );

  const questions = questionsData?.questions || [];
  const modules = modulesData?.modules || [];
  const difficulties = difficultiesData?.difficulties || [];

  const handleSave = async () => {
    try {
      if (!formData.question_text || !formData.module_id || !formData.difficulty_id) {
        toast.error("Question text, module, and difficulty are required");
        return;
      }
      
      const payload = {
         ...formData,
         module_id: parseInt(formData.module_id),
         difficulty_id: parseInt(formData.difficulty_id),
         max_marks: parseFloat(formData.max_marks.toString())
      };
      
      await client.post('/questions', payload);
      toast.success("Question added successfully!");
      setDialogOpen(false);
      setFormData(defaultFormData);
      refetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save question");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await client.delete(`/questions/${id}`);
      toast.success("Question deleted");
      refetchQuestions();
    } catch (err: any) {
      toast.error("Failed to delete question");
    }
  };

  const filteredQuestions = questions.filter(q => 
     q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage test questions across all modules</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search questions..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[250px]">
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger>
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((m: any) => (
                <SelectItem key={m.module_id} value={m.module_id.toString()}>
                  {m.module_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>                  <TableHead>Answer</TableHead>                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No questions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((q: any) => (
                  <TableRow key={q.question_id}>
                    <TableCell className="font-medium max-w-[300px] truncate" title={q.question_text}>
                       {q.question_text}
                    </TableCell>                      <TableCell className="max-w-[200px] truncate" title={q.correct_answer || '-'}>
                        {q.correct_answer || '-'}
                      </TableCell>                    <TableCell>{q.module_name || "Unknown"}</TableCell>
                    <TableCell className="capitalize">{q.question_type}</TableCell>
                    <TableCell>
                      <Badge className="capitalize font-normal" variant={q.difficulty_label === 'Hard' ? 'destructive' : q.difficulty_label === 'Medium' ? 'default' : 'secondary'}>
                        {q.difficulty_label || q.difficulty_id}
                      </Badge>
                    </TableCell>
                    <TableCell>{q.max_marks}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(q.question_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={formData.module_id} onValueChange={(val) => setFormData({ ...formData, module_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m: any) => (
                    <SelectItem key={m.module_id} value={m.module_id.toString()}>
                      {m.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={formData.question_type} onValueChange={(val) => setFormData({ ...formData, question_type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="subjective">Subjective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={formData.difficulty_id} onValueChange={(val) => setFormData({ ...formData, difficulty_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d: any) => (
                    <SelectItem key={d.difficulty_id} value={d.difficulty_id.toString()}>
                      {d.level_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marks</Label>
              <Input 
                type="number" 
                value={formData.max_marks} 
                onChange={(e) => setFormData({ ...formData, max_marks: parseFloat(e.target.value) || 0 })}
                min={0}
                step="0.5"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label>Question Text</Label>
              <Textarea 
                rows={3} 
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter your question here..."
              />
            </div>

            {formData.question_type !== 'mcq' && (
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Correct Answer (Optional)</Label>
                <Textarea 
                  rows={2} 
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  placeholder="Enter accepted answer bounds..."
                />
              </div>
            )}

            {formData.question_type === 'mcq' && (
              <div className="col-span-1 md:col-span-2 space-y-3 mt-4">
                <Label>Options</Label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Switch 
                      checked={opt.is_correct}
                      onCheckedChange={(checked) => {
                        const newOpts = [...formData.options];
                        newOpts.forEach(o => o.is_correct = false); // single correct pattern typical
                        newOpts[idx].is_correct = checked;
                        setFormData({ ...formData, options: newOpts });
                      }}
                    />
                    <Input 
                      className={`flex-1 ${opt.is_correct ? 'border-primary ring-1 ring-primary/20' : ''}`}
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].text = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}