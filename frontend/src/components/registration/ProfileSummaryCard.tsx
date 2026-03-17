import { useRegistration, SECTION_META } from "@/contexts/RegistrationContext";
import { User, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ProfileSummaryCard = () => {
  const { profilePreview, overallProgress, sectionCompletion } = useRegistration();
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="section-card p-6 space-y-6 sticky top-20">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-primary/10">
          {profilePreview.photo ? (
            <img src={profilePreview.photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <h3 className="font-display font-bold text-base">
            {profilePreview.name || 'Student Name'}
          </h3>
          <p className="text-sm text-muted-foreground">{profilePreview.email || 'email@example.com'}</p>
          {profilePreview.phone && (
            <p className="text-xs text-muted-foreground mt-0.5">{profilePreview.phone}</p>
          )}
          {profilePreview.city && (
            <p className="text-xs text-muted-foreground">{profilePreview.city}</p>
          )}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="52" className="progress-ring-track" />
            <circle
              cx="64" cy="64" r="52"
              className={cn("progress-ring-fill", overallProgress === 100 && "progress-ring-success")}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 64 64)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-display font-bold", overallProgress === 100 ? "text-success" : "text-primary")}>
              {overallProgress}%
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">COMPLETE</span>
          </div>
        </div>
      </div>

      {/* Section Checklist */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sections</h4>
        {SECTION_META.map(s => {
          const done = (sectionCompletion[s.id] ?? 0) === 100;
          return (
            <div key={s.id} className="flex items-center gap-2 py-1">
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={cn("text-sm", done ? "text-foreground font-medium" : "text-muted-foreground")}>{s.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{sectionCompletion[s.id] ?? 0}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
