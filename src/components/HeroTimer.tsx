import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import type { Skill, TimerMode } from "@/lib/types";
import { formatElapsed, formatTotalHours } from "@/lib/time";
import { getCurrentMilestone } from "@/lib/types";

interface HeroTimerProps {
  skills: Skill[];
  mode: TimerMode;
  showPracticeTip?: boolean;
}

export function HeroTimer({ skills, mode, showPracticeTip = false }: HeroTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const lockedSkill = skills.find((s) => s.lockedInAt !== null) ?? null;

  if (mode === "practice") {
    const isIdle = !lockedSkill;
    const totalMs = lockedSkill?.lockedInAt
      ? lockedSkill.timeSpentMs + (Date.now() - lockedSkill.lockedInAt)
      : 0;
    const elapsed = totalMs > 0
      ? formatElapsed(totalMs)
      : { days: "00", hours: "00", mins: "00", secs: "00" };

    const totalHours = formatTotalHours(totalMs);
    const milestone = totalMs > 0 ? getCurrentMilestone(parseFloat(totalHours)) : null;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 md:py-16 ${
          isIdle ? "bg-card border border-border" : "bg-peach"
        }`}
      >
        <div className="relative z-10 text-center">
          {!isIdle && milestone && (
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-0.5 rounded-full bg-white/15 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-white/80 font-[family-name:var(--font-display)]">
              <Target className="size-3" />
              {milestone.label} — {totalHours}h
            </div>
          )}

          <div className="flex items-start justify-center gap-6 md:gap-10 mb-4">
            <DigitGroup value={elapsed.days} label="days" pulse={false} idle={isIdle} />
            <DigitGroup value={elapsed.hours} label="hrs" pulse={false} idle={isIdle} />
            <DigitGroup value={elapsed.mins} label="min" pulse={false} idle={isIdle} />
            <DigitGroup value={elapsed.secs} label="sec" pulse={false} idle={isIdle} />
          </div>

          {!isIdle && (
            <p className="font-[family-name:var(--font-display)] text-lg md:text-xl font-medium tracking-tight text-white/90">
              {lockedSkill?.title ?? ""}
            </p>
          )}
          {isIdle && skills.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">tap the target to start practicing</p>
          )}
          {showPracticeTip && isIdle && skills.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <Target className="size-3.5" />
                tap the target button on a skill
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalMs = skills.reduce((sum, s) => sum + s.timeSpentMs + (s.lockedInAt ? Date.now() - s.lockedInAt : 0), 0);
  const totalHours = formatTotalHours(totalMs);
  const milestone = totalMs > 0 ? getCurrentMilestone(parseFloat(totalHours)) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-10 md:px-12 md:py-12">
      <div className="relative z-10 text-left">
        <p className="font-[family-name:var(--font-display)] text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          total practice
        </p>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-[family-name:var(--font-display)] text-[2.8rem] md:text-[4rem] font-bold leading-none text-foreground tabular-nums">
            {totalHours}
          </span>
          <span className="text-xl md:text-2xl text-muted-foreground/60 font-[family-name:var(--font-display)] font-semibold">
            hours
          </span>
        </div>

        {milestone && (
          <p className="text-sm text-muted-foreground">
            {milestone.label} tier &middot; {skills.length} skill{skills.length !== 1 ? "s" : ""}
          </p>
        )}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">add a skill to start tracking</p>
        )}
      </div>

      {/* Peach accent bar at bottom */}
      {totalMs > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-peach via-peach-mid to-peach-end" />
      )}
    </div>
  );
}

function DigitGroup({ value, label, pulse, idle }: { value: string; label: string; pulse: boolean; idle: boolean }) {
  return (
    <div className="flex flex-col items-center w-[56px] md:w-[80px]">
      <span
        className={`font-[family-name:var(--font-display)] text-[2.2rem] md:text-[4.5rem] font-bold leading-none tabular-nums transition-colors ${
          idle ? "text-foreground" : "text-white"
        } ${pulse ? "animate-pulse-urgent" : ""}`}
      >
        {value}
      </span>
      <span className={`font-[family-name:var(--font-body)] text-[0.6rem] font-medium uppercase tracking-[0.14em] mt-1.5 transition-colors ${
        idle ? "text-muted-foreground" : "text-white/60"
      }`}>
        {label}
      </span>
    </div>
  );
}
