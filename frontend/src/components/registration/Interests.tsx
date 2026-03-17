import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const SUGGESTIONS = ['Machine Learning', 'Web Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Mobile Development', 'UI/UX Design', 'Blockchain', 'IoT', 'DevOps', 'Game Development', 'AR/VR'];

const Interests = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData } = useRegistration();

  const [interests, setInterests] = useState<string[]>(draftData.interests || []);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (draftData?.interests) {
      setInterests(draftData.interests);
    }
  }, [draftData?.interests]);

  const toggle = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const addCustom = () => {
    if (custom.trim() && !interests.includes(custom.trim())) {
      setInterests(prev => [...prev, custom.trim()]);
      setCustom('');
    }
  };

  useEffect(() => {
    updateSectionCompletion('interests', interests.length > 0 ? 100 : 0);
  }, [interests, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => toggle(s)}
            className={`skill-tag cursor-pointer transition-colors ${interests.includes(s) ? 'bg-primary text-primary-foreground' : ''}`}
          >
            {interests.includes(s) && '✓ '}{s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Add custom interest..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
        <Button variant="outline" onClick={addCustom} disabled={!custom.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {interests.filter(i => !SUGGESTIONS.includes(i)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interests.filter(i => !SUGGESTIONS.includes(i)).map(i => (
            <span key={i} className="skill-tag">
              {i}
              <button onClick={() => toggle(i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={() => { toast.success("Interests saved!"); updateDraftAndGoNext('interests', interests); }} className="px-8">Save & Continue</Button>
      </div>
    </div>
  );
};

export default Interests;
