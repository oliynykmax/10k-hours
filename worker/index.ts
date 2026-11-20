import type { Handler } from "./_lib/context";
import * as auth from "./api/auth/[[all]]";
import * as practiceLog from "./api/practice-log";
import * as skills from "./api/skills";
import * as skill from "./api/skills/[id]";

const routes: Array<[URLPattern, Partial<Record<string, Handler>>]> = [
  [new URLPattern({ pathname: "/api/auth/*" }), { "*": auth.onRequest }],
  [
    new URLPattern({ pathname: "/api/skills" }),
    { GET: skills.onRequestGet, POST: skills.onRequestPost, PUT: skills.onRequestPut },
  ],
  [new URLPattern({ pathname: "/api/skills/:id" }), { PATCH: skill.onRequestPatch, DELETE: skill.onRequestDelete }],
  [new URLPattern({ pathname: "/api/practice-log" }), { GET: practiceLog.onRequestGet, PUT: practiceLog.onRequestPut }],
];

export default {
  async fetch(request, env) {
    for (const [pattern, methods] of routes) {
      const match = pattern.exec(request.url);
      if (!match) continue;
      const handler = methods[request.method] ?? methods["*"];
      if (!handler) return Response.json({ error: "Method not allowed" }, { status: 405 });
      return handler({ request, env, params: match.pathname.groups });
    }
    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
