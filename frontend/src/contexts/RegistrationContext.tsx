import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import client from '../api/client';

interface ProfilePreview {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  city: string;
}

export interface ResumeData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  dob?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  city?: string;
  address?: {
    current?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string; country?: string };
    permanent?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string; country?: string };
  };
  school?: {
    tenth?: { board?: string; school?: string; percentage?: number; year?: string };
    twelfth?: { board?: string; school?: string; percentage?: number; year?: string };
  };
  college?: {
    college?: string; course?: string; specialization?: string; cgpa?: string; percentage?: string;
    startYear?: string; endYear?: string;
  };
  workExperience?: Array<{
    company?: string; designation?: string; location?: string; type?: string;
    startDate?: string; endDate?: string; current?: boolean;
  }>;
  projects?: Array<{
    title?: string; description?: string; achievements?: string;
    startDate?: string; endDate?: string; skills?: string[];
  }>;
  skills?: Array<{ name?: string; version?: string; complexity?: string }>;
  languages?: Array<{ name?: string; proficiency?: string }>;
  interests?: string[];
  certifications?: Array<{
    name?: string; issuer?: string; date?: string; expiry?: string; url?: string;
  }>;
  resumeFileName?: string;
}

interface RegistrationContextType {
  sectionCompletion: Record<string, number>;
  updateSectionCompletion: (sectionId: string, percentage: number) => void;
  overallProgress: number;
  completedSections: number;
  totalSections: number;
  profilePreview: ProfilePreview;
  updateProfilePreview: (data: Partial<ProfilePreview>) => void;
  openSection: string | undefined;
  setOpenSection: (section: string | undefined) => void;
  goToNextSection: () => void;
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  draftData: Record<string, any>;
  setDraftDataDirect: (data: Record<string, any>) => void;
  updateDraftAndGoNext: (section: string, data: any) => void;
  submitRegistration: () => void;
  mode: 'registration' | 'profile';
}

const SECTIONS = ['basic', 'address', 'school', 'college', 'semesters', 'work', 'projects', 'skills', 'languages', 'interests', 'certifications'];

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode, mode?: 'registration' | 'profile' }> = ({ children, mode = 'registration' }) => {
  const [sectionCompletion, setSectionCompletion] = useState<Record<string, number>>(
    Object.fromEntries(SECTIONS.map(s => [s, 0]))
  );
  const [profilePreview, setProfilePreview] = useState<ProfilePreview>({
    name: '', email: '', phone: '', photo: null, city: '',
  });
  const [openSection, setOpenSection] = useState<string | undefined>('basic');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [draftData, setDraftData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Sync with backend on mount
  React.useEffect(() => {
    const token = localStorage.getItem('authToken'); // Changed to authToken
    if (!token) {
      setLoading(false);
      return;
    }
    client.get('/auth/registration/draft')
      .then(res => {
        let resData = res.data;
        let parsedDraft = resData.draft;
        if (typeof parsedDraft === 'string') {
          try { parsedDraft = JSON.parse(parsedDraft); } catch (e) {}
        }
        
        if (parsedDraft && typeof parsedDraft === 'object' && Object.keys(parsedDraft).length > 0) {
          setDraftData(parsedDraft);
          // Only mark sections 100% complete if they have actual data
          const newCompletion = { ...sectionCompletion };
          for (const key of Object.keys(parsedDraft)) {
            // Check if it's an array with items or an object with keys
            const val = parsedDraft[key];
            if (Array.isArray(val)) {
                if (val.length > 0) newCompletion[key] = 100;
            } else if (val && typeof val === 'object') {
                // Address has current/permanent, basic has fields etc. Avoid purely empty objects
                if (Object.values(val).some(v => v !== null && v !== '')) {
                   newCompletion[key] = 100;
                }
            } else if (val) {
                newCompletion[key] = 100;
            }
          }
          setSectionCompletion(newCompletion);

          // Update profile preview from draft data
          if (parsedDraft.basic) {
            const { firstName, middleName, lastName, email, contactNumber, photo, city } = parsedDraft.basic;
            const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
            setProfilePreview(prev => ({ ...prev, name, email: email || '', phone: contactNumber || '', photo: photo || null, city: city || '' }));
          }
        }
        if (resData.step) {
          setOpenSection(resData.step);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSectionCompletion = useCallback((sectionId: string, percentage: number) => {
    setSectionCompletion(prev => {
      if (prev[sectionId] === percentage) return prev;
      return { ...prev, [sectionId]: percentage };
    });
  }, []);

  const updateProfilePreview = useCallback((data: Partial<ProfilePreview>) => {
    setProfilePreview(prev => {
      let changed = false;
      for (const key in data) {
        if (data[key as keyof ProfilePreview] !== prev[key as keyof ProfilePreview]) {
          changed = true;
          break;
        }
      }
      if (!changed) return prev;
      return { ...prev, ...data };
    });
  }, []);

  const goToNextSection = useCallback(() => {
    if (!openSection) return;
    const idx = SECTIONS.indexOf(openSection);
    const nextSection = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : undefined;
    setOpenSection(nextSection);
    
    if (nextSection) {
      setTimeout(() => {
        const el = document.getElementById(`section-${nextSection}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [openSection]);

  const updateDraftAndGoNext = useCallback((section: string, data: any) => {
    const newDraft = { ...draftData, [section]: data };
    setDraftData(newDraft); // Local state update
    
    const token = localStorage.getItem('authToken'); // changed to authToken
    
    // Determine next section ID for saving
    let nextSectionId = 'basic';
    const idx = SECTIONS.indexOf(section);
    if (idx !== -1 && idx < SECTIONS.length - 1) {
      nextSectionId = SECTIONS[idx + 1];
    } else {
      nextSectionId = 'completed';
    }

    if (token) {
      client.put('/auth/registration/draft', { draft: newDraft, step: nextSectionId })
        .catch(console.error);
      
      if (nextSectionId === 'completed') {
        setOpenSection(undefined);
        toast.success("Section saved successfully");
      } else {
        if (mode === 'registration') {
          goToNextSection();
        } else {
          // In Profile mode, we do NOT want the wizard auto-scrolling to the next section.
          setOpenSection(undefined);
          toast.success("Changes saved successfully");
        }
      }
    } else {
      if (mode === 'registration') goToNextSection();
    }
  }, [goToNextSection, draftData, mode]);

  const submitRegistration = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("You must be logged in to submit.");
      return;
    }
    toast.info("Submitting registration...", { id: 'reg-submit' });
    client.post('/auth/registration/submit', { draft: draftData })
      .then(res => {
        toast.success("Registration complete!", { id: 'reg-submit' });
        localStorage.setItem('artiset_registration_complete', 'true');
        window.location.href = '/student'; // Full redirect to home after success
      })
      .catch(err => {
        console.error(err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to submit registration";
        toast.error(errorMsg, { id: 'reg-submit' });
      });
  }, [draftData]);

  const setDraftDataDirect = useCallback((data: Record<string, any>) => {
    setDraftData(data);
  }, []);

  const overallProgress = useMemo(() => {
    const values = Object.values(sectionCompletion);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [sectionCompletion]);

  const completedSections = useMemo(() => {
    return Object.values(sectionCompletion).filter(v => v === 100).length;
  }, [sectionCompletion]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-muted-foreground text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <RegistrationContext.Provider value={{
      sectionCompletion, updateSectionCompletion, overallProgress,
      completedSections, totalSections: SECTIONS.length,
      profilePreview, updateProfilePreview,
      openSection, setOpenSection, goToNextSection,
      resumeData, setResumeData, draftData, setDraftDataDirect, updateDraftAndGoNext,
      submitRegistration,
      mode
    }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider');
  return ctx;
};

export const SECTION_META = [
  { id: 'basic', label: 'Basic Details' },
  { id: 'address', label: 'Address Information' },
  { id: 'school', label: 'School Education' },
  { id: 'college', label: 'College Education' },
  { id: 'semesters', label: 'Semester Marks' },
  { id: 'work', label: 'Work Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Technical Skills' },
  { id: 'languages', label: 'Languages Known' },
  { id: 'interests', label: 'Interests' },
  { id: 'certifications', label: 'Certifications' },
];
