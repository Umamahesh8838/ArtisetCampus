import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subject {
  id: string; name: string; credits: number; internal: number; external: number;
}

interface Semester {
  id: string; name: string; subjects: Subject[];
}

const getGrade = (total: number): string => {
  if (total >= 90) return 'O';
  if (total >= 80) return 'A+';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B+';
  if (total >= 50) return 'B';
  if (total >= 40) return 'C';
  return 'F';
};

const getGradeClass = (grade: string) => {
  if (['O', 'A+'].includes(grade)) return 'grade-excellent';
  if (['A', 'B+'].includes(grade)) return 'grade-good';
  if (['B', 'C'].includes(grade)) return 'grade-average';
  return 'grade-poor';
};

const newSubject = (): Subject => ({
  id: crypto.randomUUID(), name: '', credits: 3, internal: 0, external: 0,
});

const SemesterMarks = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData } = useRegistration();
  const [semesters, setSemesters] = useState<Semester[]>(draftData.semesters || [
    { id: '1', name: 'Semester 1', subjects: [newSubject(), newSubject(), newSubject()] },
    { id: '2', name: 'Semester 2', subjects: [newSubject(), newSubject(), newSubject()] },
  ]);

  const updateSubject = (semIdx: number, subIdx: number, field: keyof Subject, value: any) => {
    setSemesters(prev => {
      const next = [...prev];
      const sem = { ...next[semIdx], subjects: [...next[semIdx].subjects] };
      sem.subjects[subIdx] = { ...sem.subjects[subIdx], [field]: value };
      next[semIdx] = sem;
      return next;
    });
  };

  const addSubject = (semIdx: number) => {
    setSemesters(prev => {
      const next = [...prev];
      next[semIdx] = { ...next[semIdx], subjects: [...next[semIdx].subjects, newSubject()] };
      return next;
    });
  };

  const removeSubject = (semIdx: number, subIdx: number) => {
    setSemesters(prev => {
      const next = [...prev];
      next[semIdx] = { ...next[semIdx], subjects: next[semIdx].subjects.filter((_, i) => i !== subIdx) };
      return next;
    });
  };

  const addSemester = () => {
    setSemesters(prev => [...prev, {
      id: String(prev.length + 1),
      name: `Semester ${prev.length + 1}`,
      subjects: [newSubject(), newSubject()],
    }]);
  };

  const getSemAvg = (sem: Semester) => {
    if (!sem.subjects.length) return 0;
    const totals = sem.subjects.map(s => s.internal + s.external);
    return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
  };

  const overallCGPA = (() => {
    const allAvgs = semesters.map(getSemAvg).filter(a => a > 0);
    if (!allAvgs.length) return 0;
    return (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length / 10).toFixed(2);
  })();

  useEffect(() => {
    const hasData = semesters.some(s => s.subjects.some(sub => sub.name));
    updateSectionCompletion('semesters', hasData ? 100 : 0);
  }, [semesters, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <Accordion type="multiple" defaultValue={["1"]} className="space-y-3">
        {semesters.map((sem, semIdx) => (
          <AccordionItem key={sem.id} value={sem.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-sm">{sem.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Avg: {getSemAvg(sem)}%</span>
                  <Badge variant="outline" className="text-xs">{sem.subjects.length} subjects</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Subject</TableHead>
                      <TableHead className="w-20">Credits</TableHead>
                      <TableHead className="w-24">Internal</TableHead>
                      <TableHead className="w-24">External</TableHead>
                      <TableHead className="w-20">Total</TableHead>
                      <TableHead className="w-20">Grade</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sem.subjects.map((sub, subIdx) => {
                      const total = sub.internal + sub.external;
                      const grade = getGrade(total);
                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <Input value={sub.name} onChange={e => updateSubject(semIdx, subIdx, 'name', e.target.value)} placeholder="Subject name" className="h-8 text-sm" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={sub.credits} onChange={e => updateSubject(semIdx, subIdx, 'credits', Number(e.target.value))} className="h-8 text-sm w-16" min={1} max={6} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={sub.internal} onChange={e => updateSubject(semIdx, subIdx, 'internal', Number(e.target.value))} className="h-8 text-sm w-20" min={0} max={50} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={sub.external} onChange={e => updateSubject(semIdx, subIdx, 'external', Number(e.target.value))} className="h-8 text-sm w-20" min={0} max={50} />
                          </TableCell>
                          <TableCell className="font-semibold text-sm">{total}</TableCell>
                          <TableCell>
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", getGradeClass(grade))}>
                              {grade}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSubject(semIdx, subIdx)}>
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => addSubject(semIdx)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={addSemester}>
          <Plus className="w-4 h-4 mr-1" /> Add Semester
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Overall CGPA:</span>
          <span className="text-lg font-display font-bold text-primary">{overallCGPA}</span>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Semester marks saved!"); updateDraftAndGoNext('semesters', semesters); }} className="px-8">Save & Continue</Button>
      </div>
    </div>
  );
};

export default SemesterMarks;
