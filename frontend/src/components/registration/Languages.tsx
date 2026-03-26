import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'French', 'German', 'Spanish', 'Japanese', 'Mandarin'];

const Languages = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.languages && Array.isArray(resumeData.languages)) {
      setLanguages(resumeData.languages.map((l: any) => typeof l === 'string' ? l : l.name).filter(Boolean) as string[]);
    }
  }, [resumeData]);

  const [languages, setLanguages] = useState<string[]>(Array.isArray(draftData.languages) ? (draftData.languages.map(l => typeof l === 'string' ? l : l.name).filter(Boolean) as string[]) : []);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (draftData?.languages && Array.isArray(draftData.languages)) {
      setLanguages(draftData.languages.map(l => typeof l === 'string' ? l : l.name).filter(Boolean) as string[]);
    }
  }, [draftData?.languages]);

  const add = () => {
    if (selected && !languages.includes(selected)) {
      setLanguages(prev => [...prev, selected]);
      setSelected('');
    }
  };

  const remove = (lang: string) => setLanguages(prev => prev.filter(l => l !== lang));

  useEffect(() => {
    updateSectionCompletion('languages', languages.length > 0 ? 100 : 0);
  }, [languages, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="field-label">Select Language</label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Choose a language" /></SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.filter(l => !languages.includes(l)).map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={add} disabled={!selected}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <span key={lang} className="skill-tag text-sm">
              {lang}
              <button onClick={() => remove(lang)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={() => { 
          toast.success("Languages saved!"); 
          updateDraftAndGoNext('languages', languages.map(l => ({ name: l }))); 
        }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default Languages;
