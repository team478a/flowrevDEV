---
name: Supabase RLS multi-tenant hardening
description: Non-obvious RLS pitfalls when implementing FlowRev-style 4-tier tenant isolation in Postgres/Supabase.
---

# Supabase RLS multi-tenant hardening

Lessons from implementing FlowRev §9 RLS. The spec's policies were faithful but had exploitable gaps; these are the durable rules.

## Always role-guard tenant-scoped policies
A policy that only checks `client_id = get_user_client_id()` (or `white_label_id = ...`) is NOT enough.
Lower roles can carry the same id column: a `customer` profile has a `client_id`, so a `client_id`-only
`FOR ALL` policy lets a customer manage that client's products/customers/etc.

**Rule:** every tenant-scoped policy must also assert the role, e.g.
`AND get_user_role() = 'client_owner'` (on both USING and WITH CHECK), and
`AND get_user_role() = 'white_label_owner'` on WL-owner read policies.
**Why:** policies are OR'd; a missing role guard on one policy opens cross-client/sibling-tenant access.

## Block self-escalation on profile UPDATE
A self-update policy `WITH CHECK (id = auth.uid())` lets users change their own `role`/tenant columns.
**Fix:** compare new values against the committed row via SECURITY DEFINER helpers:
`AND role = get_user_role() AND white_label_id IS NOT DISTINCT FROM get_user_white_label_id() AND client_id IS NOT DISTINCT FROM get_user_client_id()`.
Helpers read the committed (pre-UPDATE) row, so equality forbids changing those columns.

## auth.users → user_profiles trigger trust boundary
The §10-3 trigger copies `role`/`white_label_id`/`client_id` from `raw_user_meta_data`.
This is an escalation vector ONLY if untrusted clients can create users.
**Rule:** allowlist roles (never grant `system_admin` from metadata; unknown → `customer`) AND
**public self-signup must stay DISABLED in Supabase Auth** so metadata is server-controlled (service_role).
If signup is ever re-enabled, metadata trust becomes a severe escalation hole again.

## SECURITY DEFINER hardening
Helper functions and the trigger must set `SET search_path = public, pg_temp` and schema-qualify tables
(`public.user_profiles`) to prevent search_path-based privilege abuse. SECURITY DEFINER also bypasses RLS,
which is what avoids infinite recursion when policies call `get_user_role()` against `user_profiles`.

## Customer cross-table reads need a SELECT policy on the referenced table
RLS policy subqueries (`EXISTS (SELECT ... FROM purchases ...)`) run under the referenced table's RLS.
Customer "purchased course/lesson" visibility silently breaks unless customers also have a
`purchases` SELECT policy. Always trace every table a policy's subquery touches.

## Idempotency
Use `DROP POLICY IF EXISTS` before each `CREATE POLICY` and `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
so migration files are re-runnable in the SQL Editor. `CREATE OR REPLACE FUNCTION` is already idempotent.
