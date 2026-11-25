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

## deploy your own

You need a Cloudflare account and Bun.

```bash
bun install
bunx wrangler login
bunx wrangler secret put BETTER_AUTH_SECRET     # openssl rand -base64 32
bun run deploy:fresh
```

`deploy:fresh` builds the app, deploys the Worker (Wrangler creates the `10k-hours-db` D1 database) and applies the migrations. The app is then at `https://10k-hours.<your-subdomain>.workers.dev`. Set `BETTER_AUTH_URL` to that address on later deploys with `bunx wrangler deploy --var BETTER_AUTH_URL:https://...`, and add Google or GitHub sign-in as described in `ENVIRONMENT_SETUP.md`. Later deploys use `bun run deploy`. Do not run `deploy:fresh` against an existing database whose schema was applied without Wrangler migrations.

To deploy from GitHub Actions on every push to `main`, configure the `production` environment as described at the top of `.github/workflows/deploy.yml`. Every setting is in `.env.example`.

## stack

React · Tailwind · Radix · Bun · Cloudflare Workers · D1 · Better Auth
