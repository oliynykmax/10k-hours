import { useEffect, useState, useCallback, useRef } from "react";
import { Flame } from "lucide-react";
import { fetchPracticeLog, getStreakFrom, buildCalendarDays } from "@/lib/practice-log";
import type { LogEntry } from "@/lib/practice-log";

export function PracticeCalendar() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPracticeLog().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [loading]);

  const days = buildCalendarDays(entries);
  const { current, longest } = getStreakFrom(entries);
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  const weeks: { date: string; minutes: number }[][] = [];
  for (let w = 0; w < 53; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const flatIndex = (wi: number, di: number) => wi * 7 + di;

  const handleKeyDown = useCallback((e: React.KeyboardEvent, wi: number, di: number) => {
    let newIdx = flatIndex(wi, di);
    switch (e.key) {
      case "ArrowLeft": newIdx--; break;
      case "ArrowRight": newIdx++; break;
      case "ArrowUp": newIdx -= 7; break;
      case "ArrowDown": newIdx += 7; break;
      default: return;
    }
    e.preventDefault();
    if (newIdx >= 0 && newIdx < days.length) {
      setFocusedIdx(newIdx);
      const cell = document.querySelector(`[data-cell="${newIdx}"]`) as HTMLElement;
      cell?.focus();
    }
  }, [days.length]);

  const intensity = (minutes: number): string => {
    if (minutes === 0) return "bg-secondary/40";
    if (minutes < 5) return "bg-peach/20";
    if (minutes < 15) return "bg-peach/40";
    if (minutes < 30) return "bg-peach/60";
    return "bg-peach";
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

      <div ref={scrollRef} className="flex gap-0.5 overflow-x-auto pb-1" role="grid" aria-label="Practice calendar">
        <div className="flex flex-col gap-0.5 pr-1 pt-0" role="rowgroup">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[10px] text-[0.45rem] text-muted-foreground leading-[10px]" role="columnheader">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5" role="row">
            {week.map((day, di) => {
              const fi = flatIndex(wi, di);
              return (
                <button
                  key={day.date}
                  data-cell={fi}
                  className={`w-[10px] h-[10px] rounded-[2px] ${intensity(day.minutes)} focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1`}
                  onClick={() => setFocusedIdx(fi)}
                  onKeyDown={(e) => handleKeyDown(e, wi, di)}
                  onFocus={() => setFocusedIdx(fi)}
                  aria-label={`${day.date}: ${day.minutes} minute${day.minutes !== 1 ? "s" : ""}`}
                  tabIndex={fi === focusedIdx ? 0 : -1}
                  role="gridcell"
                  title={`${day.date}: ${day.minutes} minute${day.minutes !== 1 ? "s" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[0.5rem] text-muted-foreground justify-end">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-secondary/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-peach/20" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-peach/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-peach/60" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-peach" />
        <span>More</span>
      </div>
    </div>
  );
}
