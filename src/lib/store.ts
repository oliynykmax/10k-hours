import type { Skill } from "./types";

const STORE_KEY = "10k_skills";
const THEME_KEY = "10k_theme";
const MODE_KEY = "10k_mode";
const FONT_STYLE_KEY = "10k_font_style";
const STREAK_KEY = "10k_streak";

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function now(): number {
  return Date.now();
}

export function saveSkills(skills: Skill[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(skills));
}

export function loadSkills(): Skill[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const skills: Skill[] = JSON.parse(raw);
    return skills.map((s) => {
      const maxSessionMs = 4 * 60 * 60 * 1000;
      const lockedInAt = s.lockedInAt
        ? (Date.now() - s.lockedInAt > maxSessionMs ? null : s.lockedInAt)
        : null;
      const timeSpentMs = s.lockedInAt && !lockedInAt
        ? s.timeSpentMs + (Date.now() - s.lockedInAt)
        : (s.timeSpentMs ?? 0);
      return {
        ...s,
        lockedInAt,
        timeSpentMs,
        updatedAt: s.updatedAt ?? s.createdAt,
        category: s.category ?? "other",
      };
    });
  } catch {
    return [];
  }
}

export function loadTheme(): "light" | "dark" {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "dark" ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadMode(): "countdown" | "lockin" {
  const saved = localStorage.getItem(MODE_KEY);
  return saved === "lockin" ? "lockin" : "countdown";
}

export function saveMode(mode: "countdown" | "lockin"): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function loadFontStyle(): "default" | "mono" {
  const saved = localStorage.getItem(FONT_STYLE_KEY);
  return saved === "mono" ? "mono" : "default";
}

export function saveFontStyle(style: "default" | "mono"): void {
  localStorage.setItem(FONT_STYLE_KEY, style);
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastPracticeDate: "" };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastPracticeDate: "" };
  }
}

export function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function updateStreak(): StreakData {
  const data = loadStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (data.lastPracticeDate === today) return data;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.lastPracticeDate === yesterday) {
    data.currentStreak += 1;
  } else if (data.lastPracticeDate !== today) {
    data.currentStreak = 1;
  }

  data.lastPracticeDate = today;
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  saveStreak(data);
  return data;
}

const LOCKIN_TIP_KEY = "10k_tip_seen";

function getLockInTipKey(userId: string | null): string {
  return userId ? `${LOCKIN_TIP_KEY}:${userId}` : LOCKIN_TIP_KEY;
}

export function loadLockInTipSeen(userId: string | null): boolean {
  return localStorage.getItem(getLockInTipKey(userId)) === "1";
}

export function saveLockInTipSeen(userId: string | null): void {
  localStorage.setItem(getLockInTipKey(userId), "1");
}
