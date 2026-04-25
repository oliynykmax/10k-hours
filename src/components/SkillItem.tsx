import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, X, Pencil, Check, Target, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/types";
import { getCurrentMilestone } from "@/lib/types";
import { formatTotalHours } from "@/lib/time";

interface SkillItemProps {
  skill: Skill;
  index: number;
  total: number;
  onEdit: (id: string, updates: Partial<Pick<Skill, "title">>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: number) => void;
  onAddSubtask: (skillId: string, text: string) => void;
  onToggleSubtask: (skillId: string, subIndex: number) => void;
  onDeleteSubtask: (skillId: string, subIndex: number) => void;
  onStartPractice: (id: string) => void;
  onStopPractice: (id: string) => void;
}

export function SkillItem({
  skill,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartPractice,
  onStopPractice,
}: SkillItemProps) {
  const [, setTick] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(skill.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setEditTitle(skill.title);
    }
  }, [skill.title, editing]);

  const totalMs = skill.lockedInAt
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
    onEdit(skill.id, { title: editTitle.trim() });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(skill.title);
    setEditing(false);
  };

  const isPracticing = !!skill.lockedInAt;

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-xl px-4 py-4 transition-all animate-task-enter",
        "hover:border-border/80 hover:shadow-md",
        isPracticing && "border-peach/60 bg-peach/5 dark:bg-peach/10"
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
                {skill.title}
              </span>
              <Badge variant="secondary" className="text-[0.55rem] font-bold uppercase tracking-wider">
                {milestone.label}
              </Badge>
              {isPracticing && (
                <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase text-peach font-[family-name:var(--font-display)]">
                  <span className="size-1.5 rounded-full bg-peach animate-pulse" />
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
                  className="h-full bg-gradient-to-r from-peach via-peach-mid to-peach-end rounded-full transition-all duration-1000"
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
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
            <button
              onClick={() => isPracticing ? onStopPractice(skill.id) : onStartPractice(skill.id)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                isPracticing
                  ? "text-peach hover:text-peach/80 hover:bg-peach/10"
                  : "text-muted-foreground hover:text-peach hover:bg-peach/10"
              )}
              aria-label={isPracticing ? "Stop practicing" : "Start practicing"}
              aria-pressed={isPracticing}
            >
              {isPracticing ? <Square className="size-4" /> : <Target className="size-4" />}
            </button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary hover:bg-primary/10" aria-label="Edit skill">
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(skill.id, -1)} className="text-muted-foreground" aria-label="Move up">
              <ChevronUp className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={index >= total - 1} onClick={() => onMove(skill.id, 1)} className="text-muted-foreground" aria-label="Move down">
              <ChevronDown className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-overdue hover:bg-overdue-bg" onClick={() => onDelete(skill.id)} aria-label="Delete skill">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {skill.subtasks.length > 0 && !editing && (
        <div className="mt-2 ml-10">
          <Badge variant="secondary" className="text-[0.65rem] font-medium">
            {skill.subtasks.filter((s) => s.done).length}/{skill.subtasks.length} done
          </Badge>
        </div>
      )}
    </div>
  );
}
