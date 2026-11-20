import type { Handler } from "../_lib/context";
import { createAuth } from "../_lib/auth";
import { createDB } from "../_lib/db";

export const onRequestGet: Handler = async (context) => {
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = createDB(context.env.DB);
  const rows = await db.selectFrom("practice_log").selectAll().where("user_id", "=", session.user.id).execute();

  return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } });
};

export const onRequestPut: Handler = async (context) => {
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await context.request.json()) as {
    date: string;
    minutes: number;
  };

  if (!body.date || typeof body.minutes !== "number") {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
  }

  const db = createDB(context.env.DB);
  const now = Date.now();
  const id = `pl_${session.user.id}_${body.date}`;

  await db
    .insertInto("practice_log")
    .values({
      id,
      user_id: session.user.id,
      date: body.date,
      minutes: body.minutes,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.columns(["user_id", "date"]).doUpdateSet({
        minutes: body.minutes,
        updated_at: now,
      }),
    )
    .execute();

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
