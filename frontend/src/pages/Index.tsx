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

import { Button } from "@/components/ui/button";

const RegistrationContent = () => {
  const { openSection, setOpenSection, completedSections, totalSections, submitRegistration } = useRegistration();

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

        {/* Global Submit Action */}
        <div className="pt-8 pb-12 flex flex-col items-center border-t border-border mt-8">
          <h3 className="font-display font-semibold text-xl text-foreground mb-2">Ready to complete your profile?</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">Make sure all required sections are completed before submitting your registration.</p>
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
    </div>
  );
};

const Index = () => {
  return (
    <RegistrationProvider mode="registration">
      <RegistrationContent />
    </RegistrationProvider>
  );
};

export default Index;
