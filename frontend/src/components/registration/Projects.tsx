import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, Trash2, X, FolderKanban } from "lucide-react";

interface Project {
  id: string; title: string; description: string; achievements: string;
  startDate: string; endDate: string; skills: string[];
}

const Projects = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.projects && Array.isArray(resumeData.projects)) {
      setProjects(resumeData.projects.map(p => ({
        ...p,
        id: (p as any).id || crypto.randomUUID(),
        title: p.title || '',
        description: p.description || '',
        achievements: p.achievements || '',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        skills: p.skills || []
      })) as Project[]);
    }
  }, [resumeData]);

  const [projects, setProjects] = useState<Project[]>(draftData.projects || []);
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (draftData?.projects && Array.isArray(draftData.projects)) {
      setProjects(draftData.projects.map(p => ({
        ...p,
        id: p.id || crypto.randomUUID(),
        title: p.title || '',
        description: p.description || '',
        achievements: p.achievements || '',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        skills: p.skills || []
      })));
    }
  }, [draftData?.projects]);

  const add = () => setProjects(prev => [...prev, {
    id: crypto.randomUUID(), title: '', description: '', achievements: '',
    startDate: '', endDate: '', skills: [],
  }]);

  const update = (idx: number, field: string, value: any) => {
    setProjects(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  };

  const remove = (idx: number) => setProjects(prev => prev.filter((_, i) => i !== idx));

  const addSkill = (idx: number) => {
    const skill = skillInputs[projects[idx].id]?.trim();
    const currentSkills = projects[idx].skills || [];
    if (skill && !currentSkills.includes(skill)) {
      update(idx, 'skills', [...currentSkills, skill]);
      setSkillInputs(prev => ({ ...prev, [projects[idx].id]: '' }));
    }
  };

  const removeSkill = (idx: number, skill: string) => {
    const currentSkills = projects[idx].skills || [];
    update(idx, 'skills', currentSkills.filter(s => s !== skill));
  };

  const getDuration = (p: Project) => {
    if (!p.startDate || !p.endDate) return '';
    const months = Math.max(1, Math.round((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  useEffect(() => {
    updateSectionCompletion('projects', projects.length > 0 && projects.some(p => p.title) ? 100 : 0);
  }, [projects, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      {projects.map((proj, idx) => (
        <div key={proj.id} className="border rounded-xl p-5 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">{proj.title || 'New Project'}</h4>
              {getDuration(proj) && <Badge variant="outline" className="text-xs">{getDuration(proj)}</Badge>}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(idx)}>
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="field-label">Project Title <span className="field-required">*</span></label>
              <Input value={proj.title} onChange={e => update(idx, 'title', e.target.value)} placeholder="Project name" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="field-label">Description</label>
              <Textarea value={proj.description} onChange={e => update(idx, 'description', e.target.value)} placeholder="Brief description..." rows={2} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="field-label">Achievements</label>
              <Textarea value={proj.achievements} onChange={e => update(idx, 'achievements', e.target.value)} placeholder="Key achievements..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Start Date</label>
              <Input type="date" value={proj.startDate} onChange={e => update(idx, 'startDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">End Date</label>
              <Input type="date" value={proj.endDate} onChange={e => update(idx, 'endDate', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="field-label">Skills Used</label>
              <div className="flex gap-2">
                <Input
                  value={skillInputs[proj.id] || ''}
                  onChange={e => setSkillInputs(prev => ({ ...prev, [proj.id]: e.target.value }))}
                  placeholder="Add a skill..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(idx))}
                />
                <Button variant="outline" size="sm" onClick={() => addSkill(idx)}>Add</Button>
              </div>
              {proj.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {proj.skills.map(s => (
                    <span key={s} className="skill-tag">
                      {s}
                      <button onClick={() => removeSkill(idx, s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={add}>
        <Plus className="w-4 h-4 mr-1" /> Add Project
      </Button>

      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Projects saved!"); updateDraftAndGoNext('projects', projects); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default Projects;
