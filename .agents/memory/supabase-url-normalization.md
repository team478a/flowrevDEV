---
name: Supabase URL must be base origin
description: NEXT_PUBLIC_SUPABASE_URL with a path (e.g. /rest/v1/) breaks every Supabase call; normalize to origin in code.
---

# Supabase project URL must be the bare origin

`NEXT_PUBLIC_SUPABASE_URL` must be `https://<ref>.supabase.co` — the bare origin,
no path, no trailing slash. If a value copied from the dashboard includes a path
like `/rest/v1/` (or a trailing `/`), the Supabase JS client appends its own
paths on top, producing URLs like `/rest/v1/auth/v1/...` and every auth/REST/admin
call fails with **"Invalid path specified in request URL"**.

**Symptom seen:** login silently fails, admin (service_role) calls fail, and the
`next build` page-data step fails — all with the same "Invalid path" message.

**Why it bit us:** the secret value was set to `https://<ref>.supabase.co/rest/v1/`.

**How to apply:** all three client factories (`lib/supabase/{server,middleware,admin}.ts`)
pass the URL through `normalizeSupabaseUrl()` (`lib/supabase/url.ts`), which reduces
any input to `new URL(x).origin`. So a misconfigured secret no longer breaks the app.
Still prefer fixing the secret to the bare origin too.
