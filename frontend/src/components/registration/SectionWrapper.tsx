import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import { useRegistration } from "@/contexts/RegistrationContext";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  value: string;
  title: string;
  icon: React.ReactNode;
  sectionId: string;
  children: React.ReactNode;
}

const SectionWrapper = ({ value, title, icon, sectionId, children }: SectionWrapperProps) => {
  const { sectionCompletion } = useRegistration();
  const completion = sectionCompletion[sectionId] ?? 0;
  const isComplete = completion === 100;

  return (
    <AccordionItem id={`section-${value}`} value={value} className="bg-card rounded-xl border border-border overflow-hidden">
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/30 transition-colors">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isComplete ? "bg-success/10 text-success" : "bg-accent text-accent-foreground"
            )}>
              {icon}
            </div>
            <span className="font-display font-semibold text-[15px]">{title}</span>
          </div>
          {isComplete && (
            <span className="flex items-center gap-1 text-success text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5 border-t border-border">
        <div className="pt-5">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SectionWrapper;
