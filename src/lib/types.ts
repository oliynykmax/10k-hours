export type SkillCategory = "dev" | "art" | "music" | "sport" | "language" | "other";

export interface Subtask {
  text: string;
  done: boolean;
}

export interface Skill {
  id: string;
  title: string;
  category: SkillCategory;
  deadline: string | null;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: number;
  lockedInAt: number | null;
  timeSpentMs: number;
  updatedAt: number;
}

export interface MilestoneDef {
  hours: number;
  label: string;
}

export const MILESTONES: MilestoneDef[] = [
  { hours: 1, label: "Beginner" },
  { hours: 10, label: "Dabbler" },
  { hours: 100, label: "Apprentice" },
  { hours: 500, label: "Journeyman" },
  { hours: 1000, label: "Expert" },
  { hours: 5000, label: "Master" },
  { hours: 10000, label: "Grandmaster" },
];

export const CATEGORIES: { value: SkillCategory; label: string; emoji: string }[] = [
  { value: "dev", label: "Development", emoji: "💻" },
  { value: "art", label: "Art & Design", emoji: "🎨" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "sport", label: "Sports", emoji: "🏋️" },
  { value: "language", label: "Language", emoji: "🌍" },
  { value: "other", label: "Other", emoji: "⭐" },
];

export function getMilestonesFor(hours: number): { def: MilestoneDef; earned: boolean }[] {
  return MILESTONES.map((def) => ({ def, earned: hours >= def.hours }));
}

export function getCurrentMilestone(hours: number): MilestoneDef {
  let current = MILESTONES[0]!;
  for (const m of MILESTONES) {
    if (hours >= m.hours) current = m;
  }
  return current;
}

export function getNextMilestone(hours: number): MilestoneDef | null {
  for (const m of MILESTONES) {
    if (hours < m.hours) return m;
  }
  return null;
}

export function xpForHours(ms: number): number {
  return Math.floor(ms / 3600000) * 10;
}

export function levelForXp(xp: number): { level: number; currentXp: number; nextXp: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentXp = xp;
  const nextXp = level * level * 100;
  return { level, currentXp, nextXp };
}

export type TimerMode = "countdown" | "lockin";
