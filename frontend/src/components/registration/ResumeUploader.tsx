import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, X, Loader2 } from "lucide-react";

const RESUME_API_URL = (import.meta.env.VITE_API_URL || "https://artisetcampus-backend-fngbg6g3eahsf4gg.eastasia-01.azurewebsites.net") + "/resume/parse-preview";

const ResumeUploader = () => {
  const { setResumeData, setDraftDataDirect, openSection } = useRegistration();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setParsed(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".doc") || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
      setParsed(false);
    } else {
      toast.error("Please upload a PDF or DOC file");
    }
  };

  const handleFillFromResume = async () => {
    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    setParsing(true);
    const loadingToastId = toast.loading("Parsing your resume... this may take several minutes");
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800000); // 30 minutes

      const response = await fetch(RESUME_API_URL, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to parse resume");

      const data = await response.json();
      const parsedDraft = data.draft || data.parsed || {};
      const resumeHash = data.resume_hash || null;
      
      // Merge parsed resume data into resumeData for auto-fill
      const basic = parsedDraft.basic || {};

      const schoolEducation = parsedDraft.schoolEducation || [];
      const tenthObj = schoolEducation.find((s: any) => String(s.standard).includes('10')) || {};
      const twelfthObj = schoolEducation.find((s: any) => String(s.standard).includes('12')) || {};

      const school = {
        tenth: {
          board: "",
          school: tenthObj.schoolName || tenthObj.board || "",
          percentage: tenthObj.percentage || undefined,
          year: tenthObj.passingYear ? String(tenthObj.passingYear) : "",
        },
        twelfth: {
          board: "",
          school: twelfthObj.schoolName || twelfthObj.board || "",
          percentage: twelfthObj.percentage || undefined,
          year: twelfthObj.passingYear ? String(twelfthObj.passingYear) : "",
        }
      };

      const collegeEducation = parsedDraft.collegeEducation || [];
      const latestCollege = collegeEducation[0] || {};
      const college = {
        institution: latestCollege.collegeName || "",
        degree: latestCollege.courseName || "",
        branch: latestCollege.specializationName || "",
        cgpa: latestCollege.cgpa || undefined,
        startYear: latestCollege.startYear ? String(latestCollege.startYear) : "",
        endYear: latestCollege.endYear ? String(latestCollege.endYear) : "",
      };

      const addr = parsedDraft.address || {};
      const address = {
        current: {
          line1: addr.addressLine1 || "",
          line2: addr.addressLine2 || "",
          city: addr.cityName || "",
          state: addr.stateName || "",
          pincode: addr.pincode ? String(addr.pincode) : "",
          country: addr.countryName || "",
        }
      };

      const workExperience = (parsedDraft.workExperience || []).map((w: any) => ({
        company: w.companyName || "",
        designation: w.designation || "",
        location: w.location || "",
        type: w.employmentType || "",
        startDate: w.startDate || "",
        endDate: w.endDate || "",
        current: !!w.isCurrent,
      }));

      const projects = (parsedDraft.projects || []).map((p: any) => ({
        title: p.title || "",
        description: p.description || "",
        achievements: p.achievements || "",
        startDate: p.startDate || "",
        endDate: p.endDate || "",
        skills: p.skillsUsed || [],
      }));

      const skills = (parsedDraft.skills || []).map((s: any) => ({
        name: s.skillName || "",
        version: "",
        complexity: s.proficiencyLevel || "",
      }));

      const languages = (parsedDraft.languages || []).map((l: any) => ({
        name: l.languageName || "",
        proficiency: "",
      }));

      const certifications = (parsedDraft.certifications || []).map((c: any) => ({
        name: c.certificationName || "",
        issuer: c.issuingOrganization || "",
        date: c.issueDate || "",
        expiry: c.expiryDate || "",
        url: c.certificateUrl || "",
      }));

      const interests = (parsedDraft.interests || []).map((i: any) => i.interestName).filter(Boolean);

      setResumeData({
        firstName: basic.firstName || basic.first_name,
        middleName: basic.middleName || basic.middle_name,
        lastName: basic.lastName || basic.last_name,
        email: basic.email,
        contactNumber: basic.contactNumber || basic.phone || basic.contact_number,
        gender: basic.gender,
        dob: basic.dateOfBirth || basic.dob,
        linkedIn: basic.linkedinUrl || basic.linkedin_url,
        github: basic.githubUrl || basic.github_url,
        city: basic.currentCity || basic.city,
        resumeFileName: file.name,
        address,
        school,
        college,
        workExperience,
        projects,
        skills,
        languages,
        certifications,
        interests,
      });

      const mappedDraft = {
        basic: {
          firstName: basic.firstName || basic.first_name || "",
          middleName: basic.middleName || basic.middle_name || "",
          lastName: basic.lastName || basic.last_name || "",
          email: basic.email || "",
          contactNumber: basic.contactNumber || basic.phone || basic.contact_number || "",
          gender: basic.gender || "",
          dob: basic.dateOfBirth || basic.dob || "",
          linkedIn: basic.linkedinUrl || basic.linkedin_url || "",
          github: basic.githubUrl || basic.github_url || "",
          city: basic.currentCity || basic.city || ""
        },
        address,
        school,
        college: {
          college: college.institution,
          course: college.degree,
          specialization: college.branch,
          cgpa: String(college.cgpa || ""),
          percentage: "",
          startYear: college.startYear,
          endYear: college.endYear
        },
        semesters: [],
        work: workExperience,
        projects,
        skills,
        languages,
        certifications,
        interests
      };

      setDraftDataDirect(mappedDraft);
      
      // Auto-commit draft to backend so a manual refresh doesn't destroy the auto-fill
      try {
        const client = (await import("@/api/client")).default;
        await client.put('/auth/registration/draft', { draft: mappedDraft, step: openSection || 'basic' });
      } catch (e) {
        console.error('Failed to auto-save draft to backend:', e);
      }
      setParsed(true);
      toast.dismiss(loadingToastId);
      toast.success("Resume parsed! Fields have been auto-filled. Please review and complete any missing information.");
    } catch (error: any) {
      console.error("Resume parsing error:", error);
      toast.dismiss(loadingToastId);
      if (error.name === 'AbortError') {
        toast.error("Resume parsing took too long (over 30 minutes). Please try again or fill the form manually.");
      } else {
        toast.error("Failed to parse resume. Please fill the form manually or try again.");
      }
    } finally {
      setParsing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsed(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                Quick Fill with Resume
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your resume to auto-fill the registration form. You can also fill everything manually below.
              </p>
            </div>

            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse (PDF, DOC, DOCX)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                    {parsed && <span className="text-success ml-2">✓ Parsed successfully</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={clearFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleFillFromResume}
                disabled={!file || parsing}
                className="gap-2"
              >
                {parsing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {parsing ? "Parsing Resume..." : "Fill Data from Resume"}
              </Button>

              <span className="text-xs text-muted-foreground">
                or scroll down to fill manually
              </span>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
};

export default ResumeUploader;
