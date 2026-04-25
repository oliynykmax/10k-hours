import { useEffect, useState } from "react";
import { Award, Zap, Target } from "lucide-react";
import type { Skill } from "@/lib/types";
import { getCurrentMilestone, getNextMilestone, levelForXp, xpForHours } from "@/lib/types";
import { formatTotalHours } from "@/lib/time";

interface StatsBarProps {
  skills: Skill[];
}

export function StatsBar({ skills }: StatsBarProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const totalMs = skills.reduce((sum, s) => {
    const lockedExtra = s.lockedInAt ? Date.now() - s.lockedInAt : 0;
    return sum + s.timeSpentMs + lockedExtra;
  }, 0);
  const totalHours = formatTotalHours(totalMs);
  const xp = skills.reduce((sum, s) => sum + xpForHours(s.timeSpentMs), 0);
  const { level } = levelForXp(xp);
  const milestone = getCurrentMilestone(parseFloat(totalHours));
  const next = getNextMilestone(parseFloat(totalHours));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
      <StatCard icon={<Zap className="size-4" />} label="Level" value={String(level)} sub={milestone.label} />
      <StatCard icon={<Award className="size-4" />} label="Total Hours" value={totalHours} sub={next ? `${next.hours}h to next` : "maxed!"} />
      <StatCard icon={<Target className="size-4" />} label="Skills" value={String(skills.length)} sub={`active`} />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-3.5 py-3 flex items-center gap-3">
      <div className="text-primary/70">{icon}</div>
      <div className="min-w-0">
        <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-[family-name:var(--font-display)] text-lg font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[0.6rem] text-muted-foreground/60 truncate">{sub}</p>
      </div>
    </div>
  );
}
