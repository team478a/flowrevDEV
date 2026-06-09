---
name: Supabase schema / DDL application
description: How DDL (CREATE TABLE, indexes, RLS) actually gets applied to a Supabase project from this repo.
---

# Applying SQL schema to Supabase

The `service_role` / `sb_secret_...` key configured as a Replit secret only
authorizes the PostgREST data API (row reads/writes). It **cannot** run DDL
(`CREATE TABLE`, `CREATE INDEX`, RLS policies).

**How to apply:** migration `.sql` files under
`artifacts/flowrev/supabase/migrations/` are run manually in the Supabase
dashboard SQL Editor in numeric order, OR via a direct Postgres connection
string (needs the DB password, not currently stored). The agent cannot apply
them automatically with the keys on hand — hand the files to the user to run.

**Why:** chosen migration strategy is "SQL files executed in SQL Editor" (no
supabase CLI / no DB password in env). Keep migrations split <300 lines/file and
ordered so no FK references a not-yet-created table.
