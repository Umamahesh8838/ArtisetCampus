import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, Trash2, Briefcase } from "lucide-react";

interface Experience {
  id: string; company: string; location: string; designation: string;
  type: string; startDate: string; endDate: string; current: boolean;
}

const TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'];

const WorkExperience = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData } = useRegistration();
  const [experiences, setExperiences] = useState<Experience[]>(draftData.work || []);

  const add = () => setExperiences(prev => [...prev, {
    id: crypto.randomUUID(), company: '', location: '', designation: '',
    type: '', startDate: '', endDate: '', current: false,
  }]);

  const update = (idx: number, field: string, value: any) => {
    setExperiences(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const remove = (idx: number) => setExperiences(prev => prev.filter((_, i) => i !== idx));

  const getDuration = (exp: Experience) => {
    if (!exp.startDate) return '';
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : null;
    if (!end) return '';
    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return months >= 12 ? `${Math.floor(months / 12)}y ${months % 12}m` : `${months}m`;
  };

  useEffect(() => {
    updateSectionCompletion('work', experiences.length > 0 && experiences.some(e => e.company) ? 100 : 0);
  }, [experiences, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      {experiences.length > 0 && (
        <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
          <Accordion type="multiple" className="space-y-3">
            {experiences.map((exp, idx) => (
              <AccordionItem key={exp.id} value={exp.id} className="border rounded-lg px-4 relative">
                <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full pr-4">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{exp.company || 'New Experience'}</span>
                    {exp.designation && <span className="text-xs text-muted-foreground">— {exp.designation}</span>}
                    {getDuration(exp) && <span className="ml-auto text-xs text-primary font-medium">{getDuration(exp)}</span>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="field-label">Company <span className="field-required">*</span></label>
                      <Input value={exp.company} onChange={e => update(idx, 'company', e.target.value)} placeholder="Company name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">Designation</label>
                      <Input value={exp.designation} onChange={e => update(idx, 'designation', e.target.value)} placeholder="Job title" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">Location</label>
                      <Input value={exp.location} onChange={e => update(idx, 'location', e.target.value)} placeholder="City" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">Type</label>
                      <Select value={exp.type} onValueChange={v => update(idx, 'type', v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">Start Date</label>
                      <Input type="date" value={exp.startDate} onChange={e => update(idx, 'startDate', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">End Date</label>
                      <Input type="date" value={exp.endDate} onChange={e => update(idx, 'endDate', e.target.value)} disabled={exp.current} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="field-label">Currently Working</label>
                      <div className="flex items-center gap-3 pt-2">
                        <Switch checked={exp.current} onCheckedChange={v => update(idx, 'current', v)} />
                        <span className="text-sm">{exp.current ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" onClick={() => remove(idx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <Button variant="outline" onClick={add}>
        <Plus className="w-4 h-4 mr-1" /> Add Work Experience
      </Button>

      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Work experience saved!"); updateDraftAndGoNext('work', experiences); }} className="px-8">Save & Continue</Button>
      </div>
    </div>
  );
};

export default WorkExperience;
