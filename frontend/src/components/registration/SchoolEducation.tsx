import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const YEARS = Array.from({ length: 20 }, (_, i) => String(2010 + i));

const getGradeClass = (p: number) => p >= 85 ? 'grade-excellent' : p >= 70 ? 'grade-good' : p >= 50 ? 'grade-average' : 'grade-poor';

const SchoolCard = ({ title, data, onChange }: {
  title: string;
  data: { board: string; school: string; percentage: number; year: string };
  onChange: (f: string, v: any) => void;
}) => (
  <div className="border rounded-xl p-5 space-y-4 bg-card">
    <div className="flex items-center justify-between">
      <h4 className="font-display font-semibold text-sm">{title}</h4>
      <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", getGradeClass(data.percentage))}>
        {data.percentage}%
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="field-label">Board <span className="field-required">*</span></label>
        <Select value={data.board} onValueChange={v => onChange('board', v)}>
          <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
          <SelectContent>{BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="field-label">School Name <span className="field-required">*</span></label>
        <Input value={data.school} onChange={e => onChange('school', e.target.value)} placeholder="School name" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="field-label">Percentage <span className="field-required">*</span></label>
        <div className="flex items-center gap-4">
          <Slider value={[data.percentage]} onValueChange={v => onChange('percentage', v[0])} max={100} step={0.1} className="flex-1" />
          <Input type="number" value={data.percentage} onChange={e => onChange('percentage', Number(e.target.value))} className="w-20" min={0} max={100} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="field-label">Passing Year <span className="field-required">*</span></label>
        <Select value={data.year} onValueChange={v => onChange('year', v)}>
          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const SchoolEducation = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.school) {
      if (resumeData.school.tenth) setTenth(resumeData.school.tenth as any);
      if (resumeData.school.twelfth) setTwelfth(resumeData.school.twelfth as any);
    }
  }, [resumeData]);

  const [tenth, setTenth] = useState(draftData.school?.tenth || { board: '', school: '', percentage: 0, year: '' });
  const [twelfth, setTwelfth] = useState(draftData.school?.twelfth || { board: '', school: '', percentage: 0, year: '' });

  useEffect(() => {
    if (draftData?.school) {
      if (draftData.school.tenth) setTenth(draftData.school.tenth);
      if (draftData.school.twelfth) setTwelfth(draftData.school.twelfth);
    }
  }, [draftData?.school]);

  const updateTenth = (f: string, v: any) => setTenth(prev => ({ ...prev, [f]: v }));
  const updateTwelfth = (f: string, v: any) => setTwelfth(prev => ({ ...prev, [f]: v }));

  useEffect(() => {
    const req = ['board', 'school', 'year'];
    const tenthFilled = req.filter(f => tenth[f as keyof typeof tenth]).length + (tenth.percentage > 0 ? 1 : 0);
    const twelfthFilled = req.filter(f => twelfth[f as keyof typeof twelfth]).length + (twelfth.percentage > 0 ? 1 : 0);
    updateSectionCompletion('school', Math.round(((tenthFilled + twelfthFilled) / 8) * 100));
  }, [tenth, twelfth, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SchoolCard title="10th Standard" data={tenth} onChange={updateTenth} />
        <SchoolCard title="12th Standard" data={twelfth} onChange={updateTwelfth} />
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("School education saved!"); updateDraftAndGoNext('school', { tenth, twelfth }); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default SchoolEducation;
