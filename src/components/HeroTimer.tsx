import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import type { Skill, TimerMode } from "@/lib/types";
import { formatElapsed, formatTotalHours } from "@/lib/time";
import { CATEGORIES, getCurrentMilestone } from "@/lib/types";

interface HeroTimerProps {
  skills: Skill[];
  mode: TimerMode;
  showLockInTip?: boolean;
}

export function HeroTimer({ skills, mode, showLockInTip = false }: HeroTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const active = skills.filter((s) => !s.completed);
  const lockedSkill = active.find((s) => s.lockedInAt !== null) ?? null;

  if (mode === "lockin") {
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
          isIdle
            ? "bg-gradient-to-br from-amber-500/40 via-amber-500/25 to-amber-500/15"
            : "bg-gradient-to-br from-amber-600/90 via-orange-600 to-rose-700"
        }`}
      >
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "150px 150px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />

        <div className="relative z-10 text-center">
          {!isIdle && milestone && (
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-0.5 rounded-full bg-white/10 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-white/60 font-[family-name:var(--font-display)]">
              <Target className="size-3" />
              {milestone.label} — {totalHours}h
            </div>
          )}

          <div className="flex items-start justify-center gap-6 md:gap-10 mb-4">
            <DigitGroup value={elapsed.days} label="days" pulse={false} />
            <DigitGroup value={elapsed.hours} label="hrs" pulse={false} />
            <DigitGroup value={elapsed.mins} label="min" pulse={false} />
            <DigitGroup value={elapsed.secs} label="sec" pulse={false} />
          </div>

          {!isIdle && (
            <p className="font-[family-name:var(--font-display)] text-lg md:text-xl font-medium tracking-tight text-white/90">
              {lockedSkill?.title ?? ""}
            </p>
          )}
          {isIdle && active.length > 0 && (
            <p className="text-sm text-white/70 mt-2">tap the target to start practicing</p>
          )}
          {showLockInTip && isIdle && active.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="relative inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-medium text-white/90 shadow-sm">
                <Target className="size-3.5" />
                tap the target button on a skill
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalMs = active.reduce((sum, s) => sum + s.timeSpentMs + (s.lockedInAt ? Date.now() - s.lockedInAt : 0), 0);
  const totalHours = formatTotalHours(totalMs);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 md:py-16 ${
        active.length === 0
          ? "bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-green-900/20 dark:from-green-950/50 dark:via-emerald-900/30 dark:to-green-950/20"
          : "bg-gradient-to-br from-amber-500/90 via-orange-600 to-rose-700 dark:from-amber-700/90 dark:via-orange-800 dark:to-rose-900"
      }`}
    >
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_25%,rgba(255,255,255,0.1),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-0.5 rounded-full bg-white/10 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-white/60 font-[family-name:var(--font-display)]">
          total practice
        </div>

        <p className="font-[family-name:var(--font-display)] text-[3rem] md:text-[5rem] font-bold leading-none text-white tabular-nums mb-2">
          {totalHours}
          <span className="text-3xl md:text-4xl text-white/60">h</span>
        </p>

        <p className="font-[family-name:var(--font-display)] text-lg md:text-xl font-medium tracking-tight text-white/90">
          {active.length === 0
            ? "add your first skill"
            : `${active.length} skill${active.length > 1 ? "s" : ""} in progress`}
        </p>
        <p className="text-xs text-white/60 mt-1">
          toward 10,000 hours of mastery
        </p>
      </div>
    </div>
  );
}

function DigitGroup({ value, label, pulse }: { value: string; label: string; pulse: boolean }) {
  return (
    <div className="flex flex-col items-center w-[56px] md:w-[80px]">
      <span
        className={`font-[family-name:var(--font-display)] text-[2.2rem] md:text-[4.5rem] font-bold leading-none text-white tabular-nums ${
          pulse ? "animate-pulse-urgent" : ""
        }`}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-body)] text-[0.6rem] font-medium uppercase tracking-[0.14em] text-white/60 mt-1.5">
        {label}
      </span>
    </div>
  );
}
