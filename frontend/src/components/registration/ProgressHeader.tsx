import { useRegistration, SECTION_META } from "@/contexts/RegistrationContext";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const ProgressHeader = () => {
  const { overallProgress, completedSections, totalSections, sectionCompletion, openSection, setOpenSection } = useRegistration();

  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        {/* Top row */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-lg text-foreground">Artiset Campus</h1>
            <span className="text-sm text-muted-foreground hidden sm:inline">Student Registration</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">{completedSections}/{totalSections}</span>
            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  overallProgress === 100 ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              overallProgress === 100 ? "text-success" : "text-primary"
            )}>{overallProgress}%</span>
          </div>
        </div>

        {/* Section pills - scrollable */}
        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {SECTION_META.map(s => {
            const done = (sectionCompletion[s.id] ?? 0) === 100;
            const active = openSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setOpenSection(active ? undefined : s.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {done && <CheckCircle2 className="w-3 h-3" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
