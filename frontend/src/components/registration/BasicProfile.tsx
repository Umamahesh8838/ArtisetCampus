import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRegistration } from "@/contexts/RegistrationContext";
import client from "@/api/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalutations } from "@/hooks/useLookup";

const REQUIRED = ['firstName', 'lastName', 'email', 'contactNumber', 'gender', 'dob'];

const BasicProfile = () => {
  const { updateSectionCompletion, updateProfilePreview, updateDraftAndGoNext, resumeData, draftData , mode } = useRegistration();
  const fileRef = useRef<HTMLInputElement>(null);
  const SALUTATIONS = useSalutations();

  const [data, setData] = useState(() => {
    const b = draftData.basic || {};
    return {
      salutation: b.salutation || '', firstName: b.firstName || '', middleName: b.middleName || '', lastName: b.lastName || '',
      email: b.email || '', alternateEmail: b.alternateEmail || '', contactNumber: b.contactNumber || '', alternateContact: b.alternateContact || '',
      linkedIn: b.linkedIn || '', github: b.github || '', portfolio: b.portfolio || '',
      photo: b.photo || null as string | null, dob: b.dob ? new Date(b.dob) : undefined as Date | undefined,
      gender: b.gender || '', city: b.city || '', status: typeof b.status !== 'undefined' ? b.status : true,
    };
  });

  const [emailError, setEmailError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Keep local state in sync if draftData.basic arrives/updates after mount
  useEffect(() => {
    try {
      if (draftData && draftData.basic && Object.keys(draftData.basic).length > 0) {
        const b = draftData.basic;
        setData(prev => ({
          ...prev,
          salutation: b.salutation || prev.salutation || '',
          firstName: b.firstName || prev.firstName || '',
          middleName: b.middleName || prev.middleName || '',
          lastName: b.lastName || prev.lastName || '',
          email: b.email || prev.email || '',
          alternateEmail: b.alternateEmail || prev.alternateEmail || '',
          contactNumber: b.contactNumber || prev.contactNumber || '',
          alternateContact: b.alternateContact || prev.alternateContact || '',
          linkedIn: b.linkedIn || prev.linkedIn || '',
          github: b.github || prev.github || '',
          portfolio: b.portfolio || prev.portfolio || '',
          photo: b.photo || prev.photo || null,
          dob: b.dob ? new Date(b.dob) : prev.dob,
          gender: b.gender || prev.gender || '',
          city: b.city || prev.city || '',
          status: typeof b.status !== 'undefined' ? b.status : prev.status,
        }));
      }
    } catch (e) {
      // swallow any parse/format errors
    }
  }, [draftData]);

  // Auto-fill from signup data ONLY when fields are empty (first render with no draft)
  useEffect(() => {
    // Only try to fetch if we actually need these fields (meaning they are empty)
    if (data.firstName && data.lastName && data.email && data.contactNumber) {
      return;
    }

    client.get('/auth/me')
      .then(res => {
        const user = res.data;
        if (user && user.id) {
          setData(prev => ({
            ...prev,
            firstName: prev.firstName || user.first_name || '',
            lastName: prev.lastName || user.last_name || '',
            email: prev.email || user.email || '',
            contactNumber: prev.contactNumber || user.phone || '',
          }));
        }
      })
      .catch(err => {
        console.error("Error fetching user details from /auth/me:", err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (value && missingFields.includes(field)) {
      setMissingFields(prev => prev.filter(f => f !== field));
    }
  };

  useEffect(() => {
    const filled = REQUIRED.filter(f => {
      const v = data[f as keyof typeof data];
      return v !== '' && v !== undefined && v !== null;
    }).length;
    updateSectionCompletion('basic', Math.round((filled / REQUIRED.length) * 100));

    const name = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    updateProfilePreview({ name, email: data.email, phone: data.contactNumber, photo: data.photo, city: data.city });
  }, [data, updateSectionCompletion, updateProfilePreview]);

  useEffect(() => {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  }, [data.email]);

  // Auto-fill from resume data
  useEffect(() => {
    if (resumeData) {
      setData(prev => ({
        ...prev,
        firstName: resumeData.firstName || prev.firstName,
        middleName: resumeData.middleName || prev.middleName,
        lastName: resumeData.lastName || prev.lastName,
        email: resumeData.email || prev.email,
        contactNumber: resumeData.contactNumber || prev.contactNumber,
        gender: resumeData.gender || prev.gender,
        dob: resumeData.dob ? new Date(resumeData.dob) : prev.dob,
        linkedIn: resumeData.linkedIn || prev.linkedIn,
        github: resumeData.github || prev.github,
        portfolio: resumeData.portfolio || prev.portfolio,
        city: resumeData.city || prev.city,
      }));
    }
  }, [resumeData]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately using FileReader
      const reader = new FileReader();
      reader.onload = () => update('photo', reader.result as string);
      reader.readAsDataURL(file);
      
      // Upload to Azure behind the scenes
      try {
        const formData = new FormData();
        formData.append('file', file);
        const loadingToast = toast.loading('Uploading profile picture to storage...');
        const response = await client.post('/upload/profile-pic', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.url) {
          update('photo', response.data.url);
          toast.dismiss(loadingToast);
          toast.success('Profile picture saved securely.');
        }
      } catch (err: any) {
        console.error('Failed to upload profile picture', err);
        toast.error('Failed to save profile picture to cloud. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Photo & Name Row */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-28 h-28 rounded-full bg-accent border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {data.photo ? (
              <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Camera className="w-6 h-6" />
                <span className="text-[10px] mt-1">Upload</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <span className="text-[10px] text-muted-foreground">Profile Photo</span>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="space-y-1.5">
            <label className="field-label">Salutation</label>
            <Select value={data.salutation} onValueChange={v => update('salutation', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {SALUTATIONS.map((s: any) => (
                  <SelectItem key={s.salutation_id} value={s.value || s.salutation || ''}>{s.value || s.salutation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="field-firstName">First Name <span className="field-required">*</span></label>
            <Input id="field-firstName" value={data.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" className={cn(missingFields.includes('firstName') && "border-destructive focus-visible:ring-destructive")} />
            {missingFields.includes('firstName') && <p className="text-xs text-destructive mt-1">This field is required</p>}
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Middle Name</label>
            <Input value={data.middleName} onChange={e => update('middleName', e.target.value)} placeholder="Middle name" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="field-lastName">Last Name <span className="field-required">*</span></label>
            <Input id="field-lastName" value={data.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" className={cn(missingFields.includes('lastName') && "border-destructive focus-visible:ring-destructive")} />
            {missingFields.includes('lastName') && <p className="text-xs text-destructive mt-1">This field is required</p>}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="field-label" htmlFor="field-email">Email <span className="field-required">*</span></label>
          <Input id="field-email" type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" className={cn((emailError || missingFields.includes('email')) && "border-destructive focus-visible:ring-destructive")} />
          {emailError ? <p className="text-xs text-destructive mt-1">{emailError}</p> : missingFields.includes('email') ? <p className="text-xs text-destructive mt-1">This field is required</p> : null}
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Alternate Email</label>
          <Input type="email" value={data.alternateEmail} onChange={e => update('alternateEmail', e.target.value)} placeholder="alternate@email.com" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label" htmlFor="field-contactNumber">Contact Number <span className="field-required">*</span></label>
          <Input id="field-contactNumber" value={data.contactNumber} onChange={e => update('contactNumber', e.target.value)} placeholder="+91 XXXXX XXXXX" className={cn(missingFields.includes('contactNumber') && "border-destructive focus-visible:ring-destructive")} />
          {missingFields.includes('contactNumber') && <p className="text-xs text-destructive mt-1">This field is required</p>}
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Alternate Contact</label>
          <Input value={data.alternateContact} onChange={e => update('alternateContact', e.target.value)} placeholder="+91 XXXXX XXXXX" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label" htmlFor="field-dob">Date of Birth <span className="field-required">*</span></label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="field-dob" variant="outline" className={cn("w-full justify-start text-left font-normal", !data.dob && "text-muted-foreground", missingFields.includes('dob') && "border-destructive focus-visible:ring-destructive")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.dob ? format(data.dob, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single" selected={data.dob} onSelect={d => update('dob', d)}
                disabled={date => date > new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {missingFields.includes('dob') && <p className="text-xs text-destructive mt-1">This field is required</p>}
        </div>
        <div className="space-y-1.5">
          <label className="field-label" htmlFor="field-gender">Gender <span className="field-required">*</span></label>
          <Select value={data.gender} onValueChange={v => update('gender', v)}>
            <SelectTrigger id="field-gender" className={cn(missingFields.includes('gender') && "border-destructive focus-visible:ring-destructive")}><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {missingFields.includes('gender') && <p className="text-xs text-destructive mt-1">This field is required</p>}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="field-label">LinkedIn URL</label>
          <Input value={data.linkedIn} onChange={e => update('linkedIn', e.target.value)} placeholder="linkedin.com/in/..." />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">GitHub URL</label>
          <Input value={data.github} onChange={e => update('github', e.target.value)} placeholder="github.com/..." />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Portfolio URL</label>
          <Input value={data.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="yourportfolio.com" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Current City</label>
          <Input value={data.city} onChange={e => update('city', e.target.value)} placeholder="City" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Status</label>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={data.status} onCheckedChange={v => update('status', v)} />
            <span className="text-sm">{data.status ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>


      <div className="flex justify-end pt-4">
        <Button onClick={() => {
          const missing = REQUIRED.filter(f => {
            const v = data[f as keyof typeof data];
            return v === '' || v === undefined || v === null;
          });
          if (missing.length > 0) {
            setMissingFields(missing);
            toast.error("Please fill all required fields");
            setTimeout(() => {
              const el = document.getElementById(`field-${missing[0]}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }, 100);
            return;
          }
          if (emailError) {
            toast.error("Please fix email format before proceeding");
            return;
          }
          toast.success("Basic details saved!");
          updateDraftAndGoNext('basic', data);
        }} className="px-8">{mode === 'profile' ? 'Save Changes' : 'Save & Continue'}</Button>
      </div>
    </div>
  );
};

export default BasicProfile;
