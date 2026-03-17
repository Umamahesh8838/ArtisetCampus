import { Accordion } from "@/components/ui/accordion";
import { RegistrationProvider, useRegistration } from "@/contexts/RegistrationContext";
import ProgressHeader from "@/components/registration/ProgressHeader";
import ResumeUploader from "@/components/registration/ResumeUploader";
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
import {
  User, MapPin, GraduationCap, School, BookOpen,
  Briefcase, FolderKanban, Code2, Globe, Heart, Award,
} from "lucide-react";

const RegistrationContent = () => {
  const { openSection, setOpenSection } = useRegistration();

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader />

      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Resume Upload - Top of form */}
        <ResumeUploader />

        <Accordion
          type="single"
          collapsible
          value={openSection}
          onValueChange={setOpenSection}
          className="space-y-3"
        >
          <SectionWrapper value="basic" title="Basic Details" sectionId="basic" icon={<User className="w-5 h-5" />}>
            <BasicProfile />
          </SectionWrapper>

          <SectionWrapper value="address" title="Address Information" sectionId="address" icon={<MapPin className="w-5 h-5" />}>
            <AddressDetails />
          </SectionWrapper>

          <SectionWrapper value="school" title="School Education" sectionId="school" icon={<School className="w-5 h-5" />}>
            <SchoolEducation />
          </SectionWrapper>

          <SectionWrapper value="college" title="College Education" sectionId="college" icon={<GraduationCap className="w-5 h-5" />}>
            <CollegeEducation />
          </SectionWrapper>

          <SectionWrapper value="semesters" title="Semester & Subject Marks" sectionId="semesters" icon={<BookOpen className="w-5 h-5" />}>
            <SemesterMarks />
          </SectionWrapper>

          <SectionWrapper value="work" title="Work Experience" sectionId="work" icon={<Briefcase className="w-5 h-5" />}>
            <WorkExperience />
          </SectionWrapper>

          <SectionWrapper value="projects" title="Projects" sectionId="projects" icon={<FolderKanban className="w-5 h-5" />}>
            <Projects />
          </SectionWrapper>

          <SectionWrapper value="skills" title="Technical Skills" sectionId="skills" icon={<Code2 className="w-5 h-5" />}>
            <Skills />
          </SectionWrapper>

          <SectionWrapper value="languages" title="Languages Known" sectionId="languages" icon={<Globe className="w-5 h-5" />}>
            <Languages />
          </SectionWrapper>

          <SectionWrapper value="interests" title="Interests" sectionId="interests" icon={<Heart className="w-5 h-5" />}>
            <Interests />
          </SectionWrapper>

          <SectionWrapper value="certifications" title="Certifications" sectionId="certifications" icon={<Award className="w-5 h-5" />}>
            <Certifications />
          </SectionWrapper>
        </Accordion>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <RegistrationProvider>
      <RegistrationContent />
    </RegistrationProvider>
  );
};

export default Index;
