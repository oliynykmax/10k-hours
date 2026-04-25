import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, X, Pencil, Check, Target, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/DateTimePicker";
import { cn } from "@/lib/utils";
import type { Skill, SkillCategory } from "@/lib/types";
import { CATEGORIES, getCurrentMilestone, getNextMilestone, MILESTONES } from "@/lib/types";
import { formatTotalHours, dateToLocalISO } from "@/lib/time";

interface SkillItemProps {
  skill: Skill;
  index: number;
  total: number;
  onComplete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<Skill, "title" | "deadline" | "category">>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: number) => void;
  onAddSubtask: (skillId: string, text: string) => void;
  onToggleSubtask: (skillId: string, subIndex: number) => void;
  onDeleteSubtask: (skillId: string, subIndex: number) => void;
  onLockIn: (id: string) => void;
  onLockOut: (id: string) => void;
}

const categoryEmoji: Record<SkillCategory, string> = {
  dev: "💻", art: "🎨", music: "🎵", sport: "🏋️", language: "🌍", other: "⭐",
};

export function SkillItem({
  skill,
  index,
  total,
  onComplete,
  onEdit,
  onDelete,
  onMove,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onLockIn,
  onLockOut,
}: SkillItemProps) {
  const [, setTick] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(skill.title);
  const [editCategory, setEditCategory] = useState(skill.category);
  const [editDeadline, setEditDeadline] = useState<Date | undefined>(
    skill.deadline ? new Date(skill.deadline) : undefined
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!skill.completed) {
      const id = setInterval(() => setTick((n) => n + 1), 1000);
      return () => clearInterval(id);
    }
  }, [skill.completed]);

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setEditTitle(skill.title);
      setEditCategory(skill.category);
      setEditDeadline(skill.deadline ? new Date(skill.deadline) : undefined);
    }
  }, [skill.title, skill.category, skill.deadline, editing]);

  const totalMs = skill.lockedInAt && !skill.completed
    ? skill.timeSpentMs + (Date.now() - skill.lockedInAt)
    : skill.timeSpentMs;
  const totalHours = parseFloat(formatTotalHours(totalMs));
  const milestone = getCurrentMilestone(totalHours);

  const [subtaskInput, setSubtaskInput] = useState("");

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    onAddSubtask(skill.id, subtaskInput);
    setSubtaskInput("");
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    const deadlineStr = editDeadline ? dateToLocalISO(editDeadline) : null;
    onEdit(skill.id, { title: editTitle.trim(), deadline: deadlineStr, category: editCategory });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(skill.title);
    setEditCategory(skill.category);
    setEditDeadline(skill.deadline ? new Date(skill.deadline) : undefined);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-xl px-4 py-4 transition-all animate-task-enter",
        "hover:border-border/80 hover:shadow-md",
        skill.completed && "opacity-60",
        skill.lockedInAt && !skill.completed && "border-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10"
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <Input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleSaveEdit(); }
              if (e.key === "Escape") handleCancelEdit();
            }}
            aria-label="Skill name"
            className="h-9 text-base font-semibold bg-secondary/50 border-primary/20 focus-visible:border-primary"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as SkillCategory)}
            className="flex h-9 w-full rounded-lg border border-input bg-secondary/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <DateTimePicker value={editDeadline} onChange={setEditDeadline} />
          <div className="flex gap-2 justify-end pt-1">
            <Button size="sm" onClick={handleSaveEdit} className="rounded-full font-semibold shadow-sm">
              <Check className="size-3.5" />
              save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="rounded-full">
              cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={() => onComplete(skill.id)}
            className={cn(
              "mt-0.5 flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              skill.completed
                ? "bg-primary border-primary animate-check-pop"
                : "border-primary/40 hover:border-primary hover:bg-primary/10 hover:scale-110 active:scale-90"
            )}
            aria-label={skill.completed ? "Mark incomplete" : "Master skill"}
            aria-pressed={skill.completed}
          >
            {skill.completed && (
              <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="3.5 8.5 6.5 11.5 12.5 5.5" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">{categoryEmoji[skill.category]}</span>
              <span
                className={cn(
                  "font-[family-name:var(--font-display)] text-base font-semibold tracking-tight",
                  skill.completed && "line-through text-muted-foreground"
                )}
              >
                {skill.title}
              </span>
              <Badge variant="secondary" className="text-[0.55rem] font-bold uppercase tracking-wider">
                {milestone.label}
              </Badge>
              {skill.lockedInAt && !skill.completed && (
                <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase text-amber-500 font-[family-name:var(--font-display)]">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  practicing
                </span>
              )}
              <span className="ml-auto font-[family-name:var(--font-display)] text-sm font-bold tabular-nums tracking-wide text-primary">
                {formatTotalHours(totalMs)}h
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((totalHours / 10000) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[0.55rem] font-medium text-muted-foreground tabular-nums shrink-0">
                /10k
              </span>
            </div>

            {skill.subtasks.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {skill.subtasks.map((st, si) => (
                  <div key={si} className="flex items-center gap-2 group/sub">
                    <Checkbox
                      checked={st.done}
                      onCheckedChange={() => onToggleSubtask(skill.id, si)}
                      className="size-4 rounded-full"
                    />
                    <span className={cn("text-sm flex-1 min-w-0 transition-colors", st.done ? "line-through text-muted-foreground" : "text-foreground/80")}>
                      {st.text}
                    </span>
                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-overdue hover:bg-overdue-bg transition-all" onClick={() => onDeleteSubtask(skill.id, si)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!skill.completed && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
                <Input
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleAddSubtask(); }
                  }}
                  placeholder="add sub-goal…"
                  aria-label="Add sub-goal"
                  className="h-7 text-sm bg-secondary/30 border-border/50"
                />
                <Button variant="outline" size="xs" onClick={handleAddSubtask} className="rounded-full text-primary border-primary/30 shrink-0">
                  <Plus className="size-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
            {!skill.completed && (
              <>
                {skill.lockedInAt ? (
                  <Button variant="ghost" size="icon-sm" onClick={() => onLockOut(skill.id)} className="text-amber-500 hover:text-amber-500/80 hover:bg-amber-500/10" aria-label="Stop practicing" aria-pressed="true">
                    <Square className="size-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon-sm" onClick={() => onLockIn(skill.id)} className="text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10" aria-label="Start practicing" aria-pressed="false">
                    <Target className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary hover:bg-primary/10" aria-label="Edit skill">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(skill.id, -1)} className="text-muted-foreground" aria-label="Move up">
                  <ChevronUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={index >= total - 1} onClick={() => onMove(skill.id, 1)} className="text-muted-foreground" aria-label="Move down">
                  <ChevronDown className="size-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-overdue hover:bg-overdue-bg" onClick={() => onDelete(skill.id)} aria-label="Delete skill">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {skill.subtasks.length > 0 && !skill.completed && !editing && (
        <div className="mt-2 ml-10">
          <Badge variant="secondary" className="text-[0.65rem] font-medium">
            {skill.subtasks.filter((s) => s.done).length}/{skill.subtasks.length} done
          </Badge>
        </div>
      )}
    </div>
  );
}
