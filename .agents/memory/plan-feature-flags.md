---
name: Plan feature flags split
description: How plan feature flag constants/types and the server fetch function are split to avoid server-only import errors in client components.
---

## Rule
Keep feature flag constants/types in `lib/features/plan-features.ts` (no server imports — safe for any component).
Keep the DB-fetching function `getClientPlanFeatures` in `lib/features/client-features.ts` (imports `createAdminClient` which has `import "server-only"`).

**Why:** `wl-plan-form.tsx` (and other client components) need to import `PLAN_FEATURE_DEFS` to render checkboxes. If that file also contains `createAdminClient`, Next.js throws "server-only in pages/ directory" and the build fails.

**How to apply:** Any new feature-related utility that calls Supabase/admin goes in `client-features.ts`. Constants and pure functions that are safe everywhere go in `plan-features.ts`.

## hasFeature semantics
`hasFeature(features, key)` returns `true` unless `features[key] === false` (explicit opt-out).
- `plan_id` not set → empty `{}` returned → all features enabled (backward compat for existing clients).
- `plan_id` set, `features: {}` → all features enabled (no explicit false = on by default).
- `plan_id` set, `features: { lp_builder: false }` → `lp_builder` disabled.

## Nav filtering
`app/(dashboard)/layout.tsx` fetches `getClientPlanFeatures(session.clientId)` and filters `NAV_DEFS` before passing to AppShell. The `featureKey` field is stripped before being passed to `NavItem[]`.

## Page gates
`/lp`, `/members`, `/scenarios` each call `requireClientOwner()` + `getClientPlanFeatures()` at the top and return `<FeatureDisabledMessage>` early if the feature is off. React `cache()` ensures the DB call is deduplicated across layout + page in the same request.
