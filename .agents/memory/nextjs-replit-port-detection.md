---
name: Next.js on Replit artifacts (port detection)
description: Why next dev fails the artifact workflow port check and how to serve Next.js so the preview works.
---

# Next.js dev server is not detected by the Replit artifact port monitor

When a hand-hosted Next.js artifact runs `next dev`, the workflow restart fails with
`DIDNT_OPEN_A_PORT` even though Next logs `✓ Ready` and binds the port (a manual
`curl localhost:<port>` returns 200). `getWorkflowStatus` shows `openPorts: null`.

**Why:** the artifact readiness/port monitor expects a fast HTTP 200 on the
preview path. Next dev compiles routes on-demand, so the first request to `/`
hangs ~10-12s; the probe aborts (which cancels Next's compile) and loops, so the
port is never confirmed open. Other dev servers (Vite, Express) respond instantly
and are detected fine. Pointing a `[services.development.health.startup].path` at
a static `/public` file did **not** fix it — the port check is separate and still
fails.

**How to apply:** for a Next.js artifact, set the development run command to a
precompiled production serve, not `next dev`:
`next build && next start -H 0.0.0.0 -p ${PORT:-3000}`. `next start` answers
instantly so the port is detected. Tradeoff: no HMR — restart the workflow to pick
up code changes (fine for agent-driven dev where you restart after each task).
Use a generous `restart_workflow` timeout (~180s) to cover the build.

Also note: the platform injects `PORT` for the artifact (confirmed = the
`localPort` from `artifact.toml`); the dev command must bind to `$PORT`. Do not add
a `[services.env] PORT=...` override — let the platform set it.
