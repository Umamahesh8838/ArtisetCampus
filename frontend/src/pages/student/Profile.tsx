import { RegistrationProvider } from "@/contexts/RegistrationContext";
import { useRegistration, SECTION_META } from "@/contexts/RegistrationContext";
import { mapRawResumeToDraftFormat } from "@/utils/resumeMapper";
import { Accordion } from "@/components/ui/accordion";
import SectionWrapper from "@/components/registration/SectionWrapper";
import BasicProfile from "@/components/registration/BasicProfile";
import AddressDetails from "@/components/registration/AddressDetails";
import SchoolEducation from "@/components/registration/SchoolEducation";
import CollegeEducation from "@/components/registration/CollegeEducation";
import SemesterMarks from "@/components/registration/SemesterMarks";
import WorkExperience from "@/components/registration/WorkExperience";
import Projects from "@/components/registration/Projects";
import Skills from "@/components/registration/Skills";
import Languages from "@/components/registration/Languages";
import Interests from "@/components/registration/Interests";
import Certifications from "@/components/registration/Certifications";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "@/api/client";
import { toast } from 'sonner';
import {
  User, MapPin, GraduationCap, School, BookOpen,
  Briefcase, FolderKanban, Code2, Globe, Heart, Award, Edit, Save, CheckCircle2, AlertCircle,
} from "lucide-react";
import { UploadCloud } from 'lucide-react';
import { useState, useMemo } from "react";

const ICONS: Record<string, React.ReactNode> = {
  basic: <User className="w-5 h-5" />, address: <MapPin className="w-5 h-5" />,
  school: <School className="w-5 h-5" />, college: <GraduationCap className="w-5 h-5" />,
  semesters: <BookOpen className="w-5 h-5" />, work: <Briefcase className="w-5 h-5" />,
  projects: <FolderKanban className="w-5 h-5" />, skills: <Code2 className="w-5 h-5" />,
  languages: <Globe className="w-5 h-5" />, interests: <Heart className="w-5 h-5" />,
  certifications: <Award className="w-5 h-5" />,
};

const COMPONENTS: Record<string, React.FC> = {
  basic: BasicProfile, address: AddressDetails, school: SchoolEducation,
  college: CollegeEducation, semesters: SemesterMarks, work: WorkExperience,
  projects: Projects, skills: Skills, languages: Languages,
  interests: Interests, certifications: Certifications,
};

function ProfileContent() {
  const { openSection, setOpenSection, sectionCompletion, overallProgress, completedSections, totalSections, draftData, setDraftDataDirect, setResumeData, submitRegistration } = useRegistration();

  const [parsing, setParsing] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseStatusMessage, setParseStatusMessage] = useState('');
  const [resumeHash, setResumeHash] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  
  // Track selected file and successful upload status
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState<string | null>(null);

  // Check if we already have a saved resume
  const existingResumeUrl = draftData?.basic?.resumeUrl;
  const hasExistingResume = !!existingResumeUrl;
  
  const fileInputRef = React.createRef<HTMLInputElement>();

  const isDraftEmpty = useMemo(() => !draftData || Object.keys(draftData).length === 0, [draftData]);

  const applyDraftToContext = (draft: any, hash: string | null) => {
    const regDraft = mapRawResumeToDraftFormat(draft);
    setDraftDataDirect(regDraft);

    // Update resumeData used by BasicProfile
    const basic: any = regDraft.basic || {};
    setResumeData({
      firstName: basic.firstName,
      middleName: basic.middleName,
      lastName: basic.lastName,
      email: basic.email,
      contactNumber: basic.contactNumber,
      gender: basic.gender,
      dob: basic.dob,
      linkedIn: basic.linkedIn,
      github: basic.github,
      city: basic.city,
      school: regDraft.school,
      college: regDraft.college,
      workExperience: regDraft.work,
      projects: regDraft.projects,
      skills: regDraft.skills,
      languages: regDraft.languages,
      certifications: regDraft.certifications,
      interests: regDraft.interests,
    });

    if (hash) setResumeHash(hash);
    setShowSuccessBanner(true);
    setErrorBanner(null);
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      toast.error('Only PDF or DOCX files are supported');
      return;
    }

    // Immediately upload securely to Azure 
    setSelectedResumeFile(file);
    setResumeUploadStatus('Uploading securely to Azure Storage...');
    const loadingToastId = toast.loading("Uploading resume securely to Azure Storage...");
    
    try {
      const form = new FormData();
      form.append('file', file, file.name);

      const resp = await client.post('/upload/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data && resp.data.success) {
        toast.dismiss(loadingToastId);
        toast.success("Resume stored securely in Azure Storage!");
        setResumeUploadStatus(file.name + ' uploaded securely.');
        // Update local context so we immediately see "View Resume" use the new URL
        if (resp.data.url) {
          setDraftDataDirect({
            ...draftData,
            basic: { ...(draftData.basic || {}), resumeUrl: resp.data.url }
          });
        }
      } else {
        throw new Error("Failed response from Azure upload");
      }
    } catch (err: any) {
      console.error('[FRONTEND] Upload error:', err);
      toast.dismiss(loadingToastId);
      toast.error('Failed to upload resume to Azure. Please try again.');
      setResumeUploadStatus(null);
      setSelectedResumeFile(null);
    }
  };

  const handleParseResume = async () => {
    if (!selectedResumeFile) {
        toast.error("Please upload a resume first before parsing");
        return;
    }

    setParsing(true);
    setIsParsingResume(true);
    setParseStatusMessage('AI is reading your resume. This takes 1-3 minutes. Please wait...');
    const loadingToastId = toast.loading("Parsing your resume... this may take several minutes");
    
    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('file', selectedResumeFile, selectedResumeFile.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const resp = await fetch((import.meta.env.VITE_API_URL || 'https://artisetcampus-backend-fngbg6g3eahsf4gg.eastasia-01.azurewebsites.net') + '/resume/parse-preview', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        let errMsg = 'Parsing failed';
        try {
            const err = await resp.json();
            errMsg = err.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await resp.json();
      const parsedDraft = data.draft || {};
      const hash = data.resume_hash || null;
      const mappedDraft = mapRawResumeToDraftFormat(parsedDraft);

      // Save directly to the frontend's Context
      setDraftDataDirect(mappedDraft);
      if (hash) setResumeHash(hash);

      try {
        await client.put('/auth/registration/draft', { draft: mappedDraft, step: openSection || 'basic' });
      } catch (e) {
        console.error('Failed to save draft to backend:', e);
      }

      applyDraftToContext(parsedDraft, hash);
      setParseStatusMessage('Done!');
      toast.dismiss(loadingToastId);
      toast.success('Resume parsed successfully! We pre-filled the form below.');
    } catch (err: any) {
      console.error('Resume parse error', err);
      setParseStatusMessage('Failed. Please try again.');
      setErrorBanner('Could not parse resume automatically. Please fill in the form manually.');
      setShowSuccessBanner(false);
      toast.dismiss(loadingToastId);
      toast.error('Failed to parse resume.');
    } finally {
      setParsing(false);
      setIsParsingResume(false);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const retrieveCached = async () => {
    if (!resumeHash) return;
    try {
      const response = await client.get(`/resume/get-cached/${resumeHash}`);
      const parsed = response.data?.data?.parsed;
      const hash = response.data?.data?.resume_hash || resumeHash;
      if (!parsed) throw new Error('No cached parsed data');
      const mappedDraft = mapRawResumeToDraftFormat(parsed);
      applyDraftToContext(mappedDraft, hash);
      toast.success('Retrieved cached parsed data');
    } catch (error) {
      console.error('Retrieve cached error', error);
      toast.error('Could not retrieve cached parsed data. Please re-upload your resume.');
    }
  };
  return (
    <div className="space-y-6 animate-fade-in" id="registration-form">
      {isParsingResume && (
        <div style={{
          padding: '16px',
          background: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#1d4ed8', fontWeight: 600 }}>
            ⏳ {parseStatusMessage}
          </p>
          <p style={{ color: '#3b82f6', fontSize: '13px', marginTop: '4px' }}>
            Do not close this tab.
          </p>
        </div>
      )}
      {showSuccessBanner && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative flex justify-between items-start gap-3">
          <div>
            <p className="font-semibold">Resume parsed successfully!</p>
            <p className="text-sm">We have pre-filled the form below with data from your resume. Please review each section carefully, make any corrections needed, and then submit.</p>
          </div>
          <button onClick={() => setShowSuccessBanner(false)} className="text-sm font-semibold text-green-700">✕</button>
        </div>
      )}
      {errorBanner && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative flex justify-between items-start gap-3">
          <div>
            <p className="font-semibold">Could not parse resume automatically.</p>
            <p className="text-sm">Please fill in the form manually.</p>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-sm font-semibold text-red-700">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and complete your registration profile.</p>
        </div>
      </div>

      {/* Resume upload area */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {hasExistingResume && !selectedResumeFile ? "Resume Uploaded" : "Upload Resume"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resumeUploadStatus || (hasExistingResume ? "Your resume is stored securely." : "Supports PDF and DOCX files")}
                </div>
                {parseStatusMessage && <div className="text-xs font-semibold text-primary mt-1">{parseStatusMessage}</div>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} onChange={onFileChange} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" />
            {(selectedResumeFile || hasExistingResume) && !parsing && (
              <Button variant="outline" asChild>
                <a href={selectedResumeFile ? URL.createObjectURL(selectedResumeFile) : existingResumeUrl} target="_blank" rel="noopener noreferrer">
                  View Resume
                </a>
              </Button>
            )}
            <Button onClick={() => fileInputRef.current?.click()} disabled={parsing}>
              {selectedResumeFile || hasExistingResume ? "Change Resume" : "Upload Resume"}
            </Button>

            {selectedResumeFile && (
              <Button onClick={handleParseResume} disabled={parsing} className="bg-green-600 hover:bg-green-700">
                {parsing ? "Parsing..." : "Parse with AI"}
              </Button>
            )}

            {resumeHash && isDraftEmpty && (
              <Button variant="outline" onClick={retrieveCached} disabled={parsing}>
                Retrieve parsed data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress summary */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Completion</span>
              <span className="text-sm font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">{completedSections}/{totalSections} sections completed</div>
        </CardContent>
      </Card>

      {/* Section badges */}
      <div className="flex flex-wrap gap-2">
        {SECTION_META.map(s => {
          const pct = sectionCompletion[s.id] ?? 0;
          const done = pct === 100;
          return (
            <button key={s.id} onClick={() => setOpenSection(openSection === s.id ? undefined : s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                done ? "bg-success/10 text-success" : pct > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
              }`}>
              {done ? <CheckCircle2 className="h-3 w-3" /> : pct > 0 ? <AlertCircle className="h-3 w-3" /> : null}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Accordion sections */}
      <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="space-y-3">
        {SECTION_META.map(s => {
          const Comp = COMPONENTS[s.id];
          return (
            <SectionWrapper key={s.id} value={s.id} title={s.label} sectionId={s.id} icon={ICONS[s.id]}>
              <Comp />
            </SectionWrapper>
          );
        })}
      </Accordion>

      {/* Global Submit Action */}
      <div className="pt-8 pb-8 flex flex-col items-center border-t border-border mt-8">
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">Ready to complete your profile?</h3>
        <p className="text-sm text-muted-foreground mb-5 text-center max-w-md">Make sure all required sections are completed before submitting your registration.</p>
        <Button 
          onClick={submitRegistration} 
          className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-md active:scale-95 transition-all"
        >
          {completedSections < totalSections 
            ? `Complete Registration (${completedSections}/${totalSections})` 
            : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RegistrationProvider mode="profile">
      <ProfileContent />
    </RegistrationProvider>
  );
}
