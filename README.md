# 10k hours

Track hours spent on skills toward mastery. Based on the 10,000-hour rule.

Practice any skill — coding, music, art, sports, languages — and watch your hours add up. Hit milestones at 1, 10, 100, 1000, and 10000 hours. Level up as you go.

## features

- **Skill timer** — count-up timer that tracks total hours per skill
- **Milestones** — earn badges at 1h, 10h, 100h, 500h, 1000h, 5000h, 10000h
- **Gamification** — XP, levels, streaks, skill categories
- **Dashboard** — total hours, skills mastered, current streak
- **Dark mode** — toggle at the top
- **Cloud sync** — sign in with Google or GitHub to sync across devices
- **Local-first** — works offline, syncs when signed in

## dev

```bash
bun install
bun run dev    # builds with Bun, then runs wrangler dev
bun fmt && bun lint && bun check
```

## deploy

```bash
bun run deploy
```

A Cloudflare Worker serves the SPA and the `/api` routes, with D1 for storage. See `ENVIRONMENT_SETUP.md` for secrets.

## stack

React · Tailwind · Radix · Bun · Cloudflare Workers · D1 · Better Auth
