import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COURSES = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'BBA', 'M.Tech', 'MBA', 'MCA'];
const YEARS = Array.from({ length: 15 }, (_, i) => String(2015 + i));
const REQUIRED = ['college', 'course', 'startYear', 'endYear'];

const CollegeEducation = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.college) {
      setData(prev => ({
        ...prev,
        college: resumeData.college.college || prev.college,
        course: resumeData.college.course || prev.course,
        specialization: resumeData.college.specialization || prev.specialization,
        startYear: resumeData.college.startYear || prev.startYear,
        endYear: resumeData.college.endYear || prev.endYear,
        cgpa: resumeData.college.cgpa || prev.cgpa,
        percentage: resumeData.college.percentage || prev.percentage,
      }));
    }
  }, [resumeData]);

  const [data, setData] = useState({
    college: '', course: '', specialization: '',
    startYear: '', endYear: '', cgpa: '', percentage: '',
    ...draftData.college
  });

  useEffect(() => {
    if (draftData?.college) {
      setData(prev => ({ ...prev, ...draftData.college }));
    }
  }, [draftData?.college]);

  const update = (f: string, v: string) => setData(prev => ({ ...prev, [f]: v }));

  useEffect(() => {
    const filled = REQUIRED.filter(f => data[f as keyof typeof data]).length;
    updateSectionCompletion('college', Math.round((filled / REQUIRED.length) * 100));
  }, [data, updateSectionCompletion]);

  const cgpaNum = parseFloat(data.cgpa) || 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (cgpaNum / 10) * circumference;

  const durationYears = data.startYear && data.endYear ? parseInt(data.endYear) - parseInt(data.startYear) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="field-label">College <span className="field-required">*</span></label>
            <Input value={data.college} onChange={e => update('college', e.target.value)} placeholder="Search college..." />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Course <span className="field-required">*</span></label>
            <Select value={data.course} onValueChange={v => update('course', v)}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>{COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Specialization</label>
            <Input value={data.specialization} onChange={e => update('specialization', e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Start Year <span className="field-required">*</span></label>
            <Select value={data.startYear} onValueChange={v => update('startYear', v)}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">End Year <span className="field-required">*</span></label>
            <Select value={data.endYear} onValueChange={v => update('endYear', v)}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">CGPA</label>
            <Input type="number" value={data.cgpa} onChange={e => update('cgpa', e.target.value)} placeholder="0.0" min="0" max="10" step="0.1" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Percentage</label>
            <Input type="number" value={data.percentage} onChange={e => update('percentage', e.target.value)} placeholder="0.0" min="0" max="100" />
          </div>
        </div>

        {/* CGPA Circle + Timeline */}
        <div className="flex flex-col items-center gap-4 lg:min-w-[160px]">
          <div className="relative">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" className="progress-ring-track" strokeWidth="6" />
              <circle
                cx="44" cy="44" r="36"
                className={cn("progress-ring-fill", cgpaNum >= 8 && "progress-ring-success")}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 44 44)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-display font-bold text-foreground">{data.cgpa || '0.0'}</span>
              <span className="text-[9px] text-muted-foreground">CGPA</span>
            </div>
          </div>
          {durationYears > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-16 h-0.5 bg-primary" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{durationYears} year{durationYears > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("College education saved!"); updateDraftAndGoNext('college', data); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default CollegeEducation;
