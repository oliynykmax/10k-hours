import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/DateTimePicker";
import { dateToLocalISO } from "@/lib/time";
import type { SkillCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface AddSkillFormProps {
  onAdd: (title: string, category: SkillCategory, deadline: string | null) => void;
}

export function AddSkillForm({ onAdd }: AddSkillFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SkillCategory>("dev");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      const deadlineStr = deadline ? dateToLocalISO(deadline) : null;
      onAdd(title, category, deadlineStr);
      setTitle("");
      setCategory("dev");
      setDeadline(undefined);
      setShowForm(false);
    },
    [title, category, deadline, onAdd]
  );

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setTitle("");
    setCategory("dev");
    setDeadline(undefined);
  }, []);

  if (!showForm) {
    return (
      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 font-[family-name:var(--font-display)] font-medium gap-2.5 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500 hover:-translate-y-px transition-all"
        onClick={() => setShowForm(true)}
      >
        <Plus className="size-4" />
        add a skill
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 shadow-md animate-slide-down space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="what skill do you want to master?"
        aria-label="Skill name"
        className="h-11 text-base font-medium bg-secondary/50 border-primary/20 focus-visible:border-primary"
        autoFocus
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as SkillCategory)}
        className="flex h-11 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
        ))}
      </select>

      <DateTimePicker value={deadline} onChange={setDeadline} />

      <div className="flex gap-2 justify-end pt-1">
        <Button type="submit" className="rounded-full font-[family-name:var(--font-display)] font-semibold shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white">
          add skill
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel} className="rounded-full">
          cancel
        </Button>
      </div>
    </form>
  );
}
