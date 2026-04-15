import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Plus, Trash2, Award, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Certification {
  id: string; name: string; organization: string; issueDate: string;
  expiryDate: string; credentialId: string; url: string; verified: boolean;
}

const getExpiryStatus = (cert: Certification) => {
  if (!cert.expiryDate) return { label: 'Lifetime', class: 'bg-success/10 text-success' };
  const expiry = new Date(cert.expiryDate);
  if (expiry < new Date()) return { label: 'Expired', class: 'bg-destructive/10 text-destructive' };
  return { label: 'Valid', class: 'bg-success/10 text-success' };
};

const Certifications = () => {
  const { updateSectionCompletion, updateDraftAndGoNext, draftData, resumeData , mode } = useRegistration();

  useEffect(() => {
    if (resumeData?.certifications) {
      setCerts(resumeData.certifications.map((c: any) => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        verified: c.verified !== undefined ? c.verified : false
      })) as Certification[]);
    }
  }, [resumeData]);
  const navigate = useNavigate();

  const [certs, setCerts] = useState<Certification[]>(draftData.certifications || []);

  useEffect(() => {
    if (draftData?.certifications) {
      setCerts(draftData.certifications);
    }
  }, [draftData?.certifications]);

  const add = () => setCerts(prev => [...prev, {
    id: crypto.randomUUID(), name: '', organization: '', issueDate: '',
    expiryDate: '', credentialId: '', url: '', verified: false,
  }]);

  const update = (idx: number, field: string, value: any) => {
    setCerts(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  };

  const remove = (idx: number) => setCerts(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    updateSectionCompletion('certifications', certs.length > 0 && certs.some(c => c.name) ? 100 : 0);
  }, [certs, updateSectionCompletion]);

  return (
    <div className="space-y-4 animate-fade-in">
      {certs.map((cert, idx) => {
        const status = getExpiryStatus(cert);
        return (
          <div key={cert.id} className="border rounded-xl p-5 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">{cert.name || 'New Certification'}</h4>
                <Badge variant="outline" className={cn("text-xs", status.class)}>{status.label}</Badge>
                {cert.verified && <Badge className="text-xs bg-success text-success-foreground">Verified</Badge>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(idx)}>
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">Certification Name <span className="field-required">*</span></label>
                <Input value={cert.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Issuing Organization</label>
                <Input value={cert.organization} onChange={e => update(idx, 'organization', e.target.value)} placeholder="e.g. Amazon Web Services" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Credential ID</label>
                <Input value={cert.credentialId} onChange={e => update(idx, 'credentialId', e.target.value)} placeholder="ABC-12345" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Issue Date</label>
                <Input type="date" value={cert.issueDate} onChange={e => update(idx, 'issueDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Expiry Date</label>
                <Input type="date" value={cert.expiryDate} onChange={e => update(idx, 'expiryDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Certificate URL</label>
                <div className="flex gap-2">
                  <Input value={cert.url} onChange={e => update(idx, 'url', e.target.value)} placeholder="https://..." />
                  {cert.url && (
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                      <a href={cert.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Verified</label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={cert.verified} onCheckedChange={v => update(idx, 'verified', v)} />
                  <span className="text-sm">{cert.verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <Button variant="outline" onClick={add}>
        <Plus className="w-4 h-4 mr-1" /> Add Certification
      </Button>

      <div className="flex justify-end pt-4">
        <Button onClick={() => { updateDraftAndGoNext('certifications', certs); }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Finish Section'}</Button>
      </div>
    </div>
  );
};

export default Certifications;
