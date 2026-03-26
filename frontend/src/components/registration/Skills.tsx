import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, Trash2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string; name: string; version: string; complexity: string; active: boolean;
}

const COMPLEXITIES = ['Beginner', 'Intermediate', 'Advanced'];
const PROFICIENCY: Record<string, number> = { Beginner: 33, Intermediate: 66, Advanced: 100 };
const PROFICIENCY_COLOR: Record<string, string> = {
  Beginner: 'bg-warning', Intermediate: 'bg-primary', Advanced: 'bg-success',
};

const Skills = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.skills) {
      setSkills(resumeData.skills.map((s: any) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
        active: s.active !== undefined ? s.active : true
      })) as Skill[]);
    }
  }, [resumeData]);

  const [skills, setSkills] = useState<Skill[]>(draftData.skills || []);

  useEffect(() => {
    if (draftData?.skills) {
      setSkills(draftData.skills);
    }
  }, [draftData?.skills]);

  const add = () => setSkills(prev => [...prev, { id: crypto.randomUUID(), name: '', version: '', complexity: '', active: true }]);
  const update = (idx: number, field: string, value: any) => {
    setSkills(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  };
  const remove = (idx: number) => setSkills(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    updateSectionCompletion('skills', skills.length > 0 && skills.some(s => s.name) ? 100 : 0);
  }, [skills, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, idx) => (
          <div key={skill.id} className="border rounded-xl p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{skill.name || 'New Skill'}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(idx)}>
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Skill Name</label>
              <Input value={skill.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="e.g. React" className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Version</label>
              <Input value={skill.version} onChange={e => update(idx, 'version', e.target.value)} placeholder="e.g. 18.x" className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Complexity</label>
              <Select value={skill.complexity} onValueChange={v => update(idx, 'complexity', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>{COMPLEXITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {skill.complexity && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Proficiency</span>
                  <span>{PROFICIENCY[skill.complexity]}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", PROFICIENCY_COLOR[skill.complexity])} style={{ width: `${PROFICIENCY[skill.complexity]}%` }} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={skill.active} onCheckedChange={v => update(idx, 'active', v)} />
              <span className="text-xs text-muted-foreground">{skill.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={add}>
        <Plus className="w-4 h-4 mr-1" /> Add Skill
      </Button>

      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Skills saved!"); updateDraftAndGoNext('skills', skills); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default Skills;
