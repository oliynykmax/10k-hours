import type { Skill } from "@/lib/types";
import { MILESTONES, getMilestonesFor } from "@/lib/types";
import { formatTotalHours } from "@/lib/time";

interface MilestoneBarProps {
  skills: Skill[];
}

export function MilestoneBar({ skills }: MilestoneBarProps) {
  const totalMs = skills.reduce((sum, s) => {
    const lockedExtra = s.lockedInAt ? Date.now() - s.lockedInAt : 0;
    return sum + s.timeSpentMs + lockedExtra;
  }, 0);
  const totalHours = parseFloat(formatTotalHours(totalMs));
  const milestones = getMilestonesFor(totalHours);

  const maxHours = MILESTONES[MILESTONES.length - 1]?.hours ?? 10000;
  const progressPct = Math.min((totalHours / maxHours) * 100, 100);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold">Milestones</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{totalHours.toFixed(1)}h / 10,000h</span>
      </div>

      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-peach via-peach-mid to-peach-end rounded-full transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {milestones.map(({ def, earned }) => (
          <span
            key={def.hours}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.55rem] font-bold uppercase tracking-wider transition-all ${
              earned
                ? "bg-peach/20 text-peach dark:text-peach border border-peach/30"
                : "bg-secondary text-muted-foreground/70 border border-transparent"
            }`}
          >
            {earned ? "✓" : "○"} {def.hours}h {def.label}
          </span>
        ))}
      </div>
    </div>
  );
}
