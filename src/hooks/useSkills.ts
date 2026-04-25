import { useState, useCallback, useEffect, useRef } from "react";
import type { Skill } from "@/lib/types";
import { uid, now, saveSkills, loadSkills } from "@/lib/store";
import { recordPractice } from "@/lib/practice-log";
import { useSession } from "@/lib/auth-client";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export function useSkills() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [skills, setSkills] = useState<Skill[]>(loadSkills);
  const syncedRef = useRef(false);
  const hydrationDoneRef = useRef(false);
  const skipSyncRef = useRef(false);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevUserIdRef.current && !userId) {
      setSkills(loadSkills());
      syncedRef.current = false;
      hydrationDoneRef.current = false;
    } else if (prevUserIdRef.current && userId && prevUserIdRef.current !== userId) {
      setSkills([]);
      syncedRef.current = false;
      hydrationDoneRef.current = false;
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      syncedRef.current = false;
      hydrationDoneRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      try {
        const localSkills = loadSkills();
        const serverSkills: Skill[] = await apiFetch("/skills");

        if (localSkills.length === 0) {
          setSkills(serverSkills);
          return;
        }

        const mergedMap = new Map(serverSkills.map((s) => [s.id, s]));
        for (const local of localSkills) {
          const server = mergedMap.get(local.id);
          if (!server || (local.updatedAt ?? 0) > (server.updatedAt ?? 0)) {
            mergedMap.set(local.id, local);
          }
        }

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
        );

        const reconciled: Skill[] = await apiFetch("/skills", {
          method: "PUT",
          body: JSON.stringify({ skills: merged }),
        });

        setSkills(reconciled);
        saveSkills([]);
      } catch (e) {
        console.error("Failed to load skills from server:", e);
      } finally {
        hydrationDoneRef.current = true;
      }
    })();
  }, [userId]);

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skillsRef = useRef(skills);
  skillsRef.current = skills;

  useEffect(() => {
    if (!userId) {
      saveSkills(skills);
      return;
    }

    if (!hydrationDoneRef.current) return;

    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const serverSkills: Skill[] = await apiFetch("/skills", {
          method: "PUT",
          body: JSON.stringify({ skills: skillsRef.current }),
        });
        skipSyncRef.current = true;
        setSkills(serverSkills);
      } catch (e) {
        console.error("Failed to sync skills:", e);
      }
    }, 2000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [skills, userId]);

  const addSkill = useCallback((title: string) => {
    const t = now();
    const skill: Skill = {
      id: uid(),
      title: title.trim(),
      subtasks: [],
      createdAt: t,
      lockedInAt: null,
      timeSpentMs: 0,
      updatedAt: t,
    };
    setSkills((prev) => [...prev, skill]);
  }, []);

  const editSkill = useCallback((id: string, updates: Partial<Pick<Skill, "title">>) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now() } : s))
    );
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveSkill = useCallback((id: string, direction: number) => {
    setSkills((prev) => {
      const active = prev.filter((s) => !s.completed);
      const idx = active.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= active.length) return prev;

      const fullIdx = prev.findIndex((s) => s.id === active[idx]!.id);
      const fullNewIdx = prev.findIndex((s) => s.id === active[newIdx]!.id);
      const next = [...prev];
      [next[fullIdx], next[fullNewIdx]] = [next[fullNewIdx]!, next[fullIdx]!];
      return next.map((s) => ({ ...s, updatedAt: now() }));
    });
  }, []);

  const addSubtask = useCallback((skillId: string, text: string) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId
          ? { ...s, subtasks: [...s.subtasks, { text: text.trim(), done: false }], updatedAt: now() }
          : s
      )
    );
  }, []);

  const toggleSubtask = useCallback((skillId: string, subIndex: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId
          ? {
              ...s,
              subtasks: s.subtasks.map((st, i) =>
                i === subIndex ? { ...st, done: !st.done } : st
              ),
              updatedAt: now(),
            }
          : s
      )
    );
  }, []);

  const deleteSubtask = useCallback((skillId: string, subIndex: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, subtasks: s.subtasks.filter((_, i) => i !== subIndex), updatedAt: now() } : s
      )
    );
  }, []);

  const lockIn = useCallback((id: string) => {
    const t = now();
    setSkills((prev) =>
      prev.map((skill) => {
        if (skill.id === id) return { ...skill, lockedInAt: t, updatedAt: t };
        if (skill.lockedInAt !== null) return { ...skill, lockedInAt: null, timeSpentMs: skill.timeSpentMs + (t - skill.lockedInAt), updatedAt: t };
        return skill;
      })
    );
  }, []);

  const lockOut = useCallback((id: string) => {
    const t = now();
    setSkills((prev) =>
      prev.map((skill) => {
        if (skill.id === id) {
          const sessionMs = skill.lockedInAt ? t - skill.lockedInAt : 0;
          if (sessionMs > 0) recordPractice(sessionMs);
          return { ...skill, lockedInAt: null, timeSpentMs: skill.timeSpentMs + sessionMs, updatedAt: t };
        }
        return skill;
      })
    );
  }, []);

  return {
    skills,
    addSkill,
    editSkill,
    deleteSkill,
    moveSkill,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    lockIn,
    lockOut,
  };
}
