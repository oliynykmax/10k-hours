import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, Timer, Type } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { HeroTimer } from "@/components/HeroTimer";
import { AddSkillForm } from "@/components/AddSkillForm";
import { SkillItem } from "@/components/SkillItem";
import { StatsBar } from "@/components/StatsBar";
import { MilestoneBar } from "@/components/MilestoneBar";
import { PracticeCalendar } from "@/components/PracticeCalendar";
import { useSkills } from "@/hooks/useSkills";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { loadPracticeTipSeen, savePracticeTipSeen } from "@/lib/store";
import type { TimerMode } from "@/lib/types";

export default function App() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const {
    skills,
    addSkill,
    editSkill,
    deleteSkill,
    moveSkill,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    startPractice,
    stopPractice,
  } = useSkills();

  const { theme, toggleTheme, mode, setTimerMode: _setTimerMode, fontStyle, toggleFontStyle } = useTheme();
  const [showPracticeTip, setShowPracticeTip] = useState(false);

  useEffect(() => {
    setShowPracticeTip(!loadPracticeTipSeen(userId));
  }, [userId]);

  const setTimerMode = useCallback((m: TimerMode) => {
    if (m === "overview") {
      const locked = skills.find((t) => t.lockedInAt);
      if (locked) stopPractice(locked.id);
    }
    _setTimerMode(m);
  }, [skills, stopPractice, _setTimerMode]);

  const handleStartPractice = useCallback((id: string) => {
    startPractice(id);
    _setTimerMode("practice");
    if (showPracticeTip) {
      savePracticeTipSeen(userId);
      setShowPracticeTip(false);
    }
  }, [startPractice, _setTimerMode, showPracticeTip, userId]);

  const handleStopPractice = useCallback((_id: string) => {
    setTimerMode("overview");
  }, [setTimerMode]);

  const hasSkills = skills.length > 0;

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-8 h-dvh flex flex-col overflow-hidden">
      <header className="py-4 md:py-5 shrink-0">
        <div className="rounded-2xl border border-border/70 bg-card/85 px-3 py-2 shadow-sm md:px-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="mr-auto min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-foreground md:text-[1.9rem]">
                10k<span className="text-peach">h</span>
              </h1>
            </div>

            <div className="order-3 w-full sm:order-none sm:w-auto">
              <div className="grid grid-cols-2 items-center rounded-xl border border-border/70 bg-background/70 p-1">
                <button
                  onClick={() => setTimerMode("overview")}
                  className={cn(
                    "flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold tracking-wide transition-all",
                    mode === "overview"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={mode === "overview"}
                  aria-label="Overview mode"
                >
                  <Timer className="size-3" />
                  overview
                </button>
                <button
                  onClick={() => setTimerMode("practice")}
                  className={cn(
                    "flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold tracking-wide transition-all",
                    mode === "practice"
                      ? "bg-peach text-peach-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={mode === "practice"}
                  aria-label="Practice mode"
                >
                  <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 4v4l2.5 1.5" />
                  </svg>
                  practice
                </button>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 p-1">
              <AuthButton />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleFontStyle}
                className={cn(
                  "rounded-lg text-muted-foreground",
                  fontStyle === "mono"
                    ? "mono-chip text-primary"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                aria-label="Toggle monospace style"
                aria-pressed={fontStyle === "mono"}
                title={fontStyle === "mono" ? "Mono mode on" : "Mono mode"}
              >
                <Type className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-[5fr_4fr] grid-rows-[auto_1fr] md:grid-rows-1 gap-5 md:gap-10 flex-1 min-h-0 overflow-hidden">
        <section className="shrink-0 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          <HeroTimer skills={skills} mode={mode} showPracticeTip={showPracticeTip} />
          {mode === "overview" && (
            <>
              <StatsBar skills={skills} />
              <MilestoneBar skills={skills} />
              {hasSkills && <PracticeCalendar />}
            </>
          )}
        </section>

        <section className="min-w-0 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0">
            <AddSkillForm onAdd={addSkill} />
          </div>

          <div className="task-scroll flex-1 overflow-y-auto space-y-2.5 min-h-0 py-1 pr-2">
            {skills.map((skill, i) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                index={i}
                total={skills.length}
                onEdit={editSkill}
                onDelete={deleteSkill}
                onMove={moveSkill}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onStartPractice={handleStartPractice}
                onStopPractice={handleStopPractice}
              />
            ))}

            {!hasSkills && (
              <div className="text-center py-12">
                <div className="text-muted-foreground/40 mb-3 flex justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" />
                  </svg>
                </div>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-muted-foreground mb-1">
                  no skills yet
                </p>
                <p className="text-sm text-muted-foreground/60">
                  add one above to start tracking hours
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-5 text-center text-xs text-muted-foreground/60 tracking-wide shrink-0">
        10,000 hours to mastery
      </footer>
    </div>
  );
}
