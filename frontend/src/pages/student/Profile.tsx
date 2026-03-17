import { RegistrationProvider } from "@/contexts/RegistrationContext";
import { useRegistration, SECTION_META } from "@/contexts/RegistrationContext";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User, MapPin, GraduationCap, School, BookOpen,
  Briefcase, FolderKanban, Code2, Globe, Heart, Award, Edit, Save, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useState } from "react";

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
  const { openSection, setOpenSection, sectionCompletion, overallProgress, completedSections, totalSections } = useRegistration();
  const [editMode, setEditMode] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and complete your registration profile.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setEditMode(!editMode)}>
          {editMode ? <><Save className="h-4 w-4" /> Save All</> : <><Edit className="h-4 w-4" /> Edit Profile</>}
        </Button>
      </div>

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
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RegistrationProvider>
      <ProfileContent />
    </RegistrationProvider>
  );
}
