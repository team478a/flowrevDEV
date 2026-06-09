---
name: Supabase SSR middleware gotchas
description: Two recurring bugs when writing Next.js App Router middleware with @supabase/ssr — cookie loss on redirect, and public-path prefix matching.
---

# Supabase SSR middleware (Next.js App Router)

## 1. Cookie loss on redirect
`getUser()` may refresh the session and queue new auth cookies onto the
`supabaseResponse` (the `NextResponse.next(...)` you build with the `setAll`
cookie adapter). If you then return a *different* response (e.g.
`NextResponse.redirect(...)`) you drop those refreshed cookies and the user
can get logged out / looped.

**Rule:** when redirecting from middleware, copy cookies from the base response
onto the redirect response before returning it.
```ts
const res = NextResponse.redirect(new URL(path, request.url));
base.cookies.getAll().forEach((c) => res.cookies.set(c));
return res;
```

**Why:** the cookie writes live on the object created inside `setAll`; a fresh
redirect Response starts with no cookies.

## 2. Public-path prefix matching
A common matcher is:
```ts
prefix === pathname || pathname.startsWith(`${prefix}/`)
```
If a prefix already ends with `/` (e.g. `"/p/"`), the second branch checks
`startsWith("/p//")` and never matches `/p/foo` — the public page gets
redirected to `/login`.

**Rule:** store prefixes WITHOUT trailing slashes (`"/p"`, `"/auth"`); let the
matcher append the slash. Verify with an unauth curl to a public sub-path.

**How to apply:** any time you maintain a PUBLIC_PREFIXES-style allowlist in
middleware, keep entries slashless and add a curl check for each public route.
