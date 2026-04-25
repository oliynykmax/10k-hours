import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddSkillFormProps {
  onAdd: (title: string) => void;
}

export function AddSkillForm({ onAdd }: AddSkillFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onAdd(title);
      setTitle("");
      setShowForm(false);
    },
    [title, onAdd]
  );

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setTitle("");
  }, []);

  if (!showForm) {
    return (
      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-lockin/40 text-lockin font-[family-name:var(--font-display)] font-medium gap-2.5 bg-lockin/5 hover:bg-lockin/15 hover:border-lockin hover:-translate-y-px transition-all"
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

      <div className="flex gap-2 justify-end pt-1">
        <Button type="submit" className="rounded-full font-[family-name:var(--font-display)] font-semibold shadow-md shadow-lockin/20 bg-lockin hover:bg-lockin-mid text-lockin-foreground">
          add skill
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel} className="rounded-full">
          cancel
        </Button>
      </div>
    </form>
  );
}
