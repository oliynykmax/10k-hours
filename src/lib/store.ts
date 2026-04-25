import type { Skill } from "./types";

const STORE_KEY = "10k_skills";
const THEME_KEY = "10k_theme";
const MODE_KEY = "10k_mode";
const FONT_STYLE_KEY = "10k_font_style";
const PRACTICE_TIP_KEY = "10k_tip_seen";

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

export function loadMode(): "overview" | "practice" {
  const saved = localStorage.getItem(MODE_KEY);
  return saved === "practice" ? "practice" : "overview";
}

export function saveMode(mode: "overview" | "practice"): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function loadFontStyle(): "default" | "mono" {
  const saved = localStorage.getItem(FONT_STYLE_KEY);
  return saved === "mono" ? "mono" : "default";
}

export function saveFontStyle(style: "default" | "mono"): void {
  localStorage.setItem(FONT_STYLE_KEY, style);
}

function getPracticeTipKey(userId: string | null): string {
  return userId ? `${PRACTICE_TIP_KEY}:${userId}` : PRACTICE_TIP_KEY;
}

export function loadPracticeTipSeen(userId: string | null): boolean {
  return localStorage.getItem(getPracticeTipKey(userId)) === "1";
}

export function savePracticeTipSeen(userId: string | null): void {
  localStorage.setItem(getPracticeTipKey(userId), "1");
}
