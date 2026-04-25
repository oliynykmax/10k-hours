import { createAuth } from "../../_lib/auth";
import { createDB, skillRowToClient } from "../../_lib/db";

export const onRequestPatch: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const id = context.params.id as string;
  const body = await context.request.json() as Partial<{
    title: string;
    category: string;
    deadline: string | null;
    completed: boolean;
    subtasks: Array<{ text: string; done: boolean }>;
    lockedInAt: number | null;
    timeSpentMs: number;
    updatedAt: number;
  }>;

  const db = createDB(context.env.DB as D1Database);

  const updates: Record<string, any> = { updated_at: body.updatedAt ?? Date.now() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.category !== undefined) updates.category = body.category;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.completed !== undefined) updates.completed = body.completed ? 1 : 0;
  if (body.subtasks !== undefined) updates.subtasks = JSON.stringify(body.subtasks);
  if (body.lockedInAt !== undefined) updates.locked_in_at = body.lockedInAt;
  if (body.timeSpentMs !== undefined) updates.time_spent_ms = body.timeSpentMs;

  await db
    .updateTable("skill")
    .set(updates)
    .where("id", "=", id)
    .where("user_id", "=", session.user.id)
    .execute();

  const updated = await db
    .selectFrom("skill")
    .selectAll()
    .where("id", "=", id)
    .where("user_id", "=", session.user.id)
    .execute();

  if (updated.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify(skillRowToClient(updated[0]!)),
    { headers: { "Content-Type": "application/json" } },
  );
};

export const onRequestDelete: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const id = context.params.id as string;
  const db = createDB(context.env.DB as D1Database);

  await db
    .deleteFrom("skill")
    .where("id", "=", id)
    .where("user_id", "=", session.user.id)
    .execute();

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
