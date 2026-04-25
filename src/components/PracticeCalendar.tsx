import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { fetchPracticeLog, getStreakFrom, buildCalendarDays } from "@/lib/practice-log";
import type { LogEntry } from "@/lib/practice-log";

export function PracticeCalendar() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticeLog().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const days = buildCalendarDays(entries);
  const { current, longest } = getStreakFrom(entries);
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  const weeks: { date: string; minutes: number }[][] = [];
  for (let w = 0; w < 53; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const intensity = (minutes: number): string => {
    if (minutes === 0) return "bg-secondary/40";
    const ratio = minutes / maxMinutes;
    if (ratio < 0.25) return "bg-lockin/20";
    if (ratio < 0.5) return "bg-lockin/40";
    if (ratio < 0.75) return "bg-lockin/60";
    return "bg-lockin";
  };

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="h-4 w-40 animate-pulse bg-muted rounded" />
        <div className="h-[122px] animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold">Practice Calendar</h3>
        <div className="flex items-center gap-1.5 text-sm">
          <Flame className="size-4 text-orange-500" />
          <span className="font-bold tabular-nums">{current}</span>
          <span className="text-xs text-muted-foreground">day{current !== 1 ? "s" : ""}</span>
          {longest > current && (
            <span className="text-[0.55rem] text-muted-foreground ml-1">best: {longest}</span>
          )}
        </div>
      </div>

      <div className="flex gap-0.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-0.5 pr-1 pt-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[10px] text-[0.45rem] text-muted-foreground leading-[10px]">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-[10px] h-[10px] rounded-[2px] ${intensity(day.minutes)}`}
                title={`${day.date}: ${day.minutes}m`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[0.5rem] text-muted-foreground justify-end">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-secondary/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-lockin/20" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-lockin/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-lockin/60" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-lockin" />
        <span>More</span>
      </div>
    </div>
  );
}
