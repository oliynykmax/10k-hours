const LOG_KEY = "10k_practice_log";

export interface LogEntry {
  id?: string;
  user_id?: string;
  date: string;
  minutes: number;
  updated_at?: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

function loadLocal(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return Object.entries(JSON.parse(raw)).map(([date, minutes]) => ({
      date,
      minutes: minutes as number,
    }));
  } catch {
    return [];
  }
}

function saveLocal(entries: LogEntry[]): void {
  const obj: Record<string, number> = {};
  for (const e of entries) {
    obj[e.date] = e.minutes;
  }
  localStorage.setItem(LOG_KEY, JSON.stringify(obj));
}

let cachedEntries: LogEntry[] | null = null;

export async function fetchPracticeLog(): Promise<LogEntry[]> {
  if (cachedEntries) return cachedEntries;

  try {
    const data = await apiFetch<LogEntry[]>("/practice-log");
    cachedEntries = data;
    return data;
  } catch {
    return loadLocal();
  }
}

export async function recordPractice(durationMs: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const addMinutes = Math.round(durationMs / 60000);

  try {
    const existing = await apiFetch<LogEntry[]>("/practice-log");
    const existingToday = existing.find((e) => e.date === today);
    const total = (existingToday?.minutes ?? 0) + addMinutes;

    await apiFetch("/practice-log", {
      method: "PUT",
      body: JSON.stringify({ date: today, minutes: total }),
    });

    cachedEntries = null;
  } catch {
    const local = loadLocal();
    const existing = local.find((e) => e.date === today);
    if (existing) {
      existing.minutes += addMinutes;
    } else {
      local.push({ date: today, minutes: addMinutes });
    }
    saveLocal(local);
  }
}

export function getStreakFrom(entries: LogEntry[]): { current: number; longest: number } {
  const dates = entries
    .filter((e) => e.minutes > 0)
    .map((e) => e.date)
    .sort()
    .reverse();

  let current = 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dates[0] !== today && dates[0] !== yesterday) {
    current = 0;
  } else {
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      if (dates[i] === expected) {
        current++;
      } else {
        break;
      }
    }
  }

  let longest = 0;
  let run = 0;
  const sorted = [...dates].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || daysBetween(sorted[i - 1]!, sorted[i]!) === 1) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  return { current, longest };
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function buildCalendarDays(entries: LogEntry[]): { date: string; minutes: number }[] {
  const map = new Map(entries.map((e) => [e.date, e.minutes]));
  const days: { date: string; minutes: number }[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, minutes: map.get(key) ?? 0 });
  }
  return days;
}

export function clearCache(): void {
  cachedEntries = null;
}
