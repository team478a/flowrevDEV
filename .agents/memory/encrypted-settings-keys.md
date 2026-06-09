---
name: Encrypted provider keys (email/AI) in DB
description: How FlowRev stores third-party API keys (Resend, Anthropic, OpenAI) encrypted in Postgres with a hybrid HQ/WL resolution, and why.
---

# Encrypted provider keys (email / AI)

Provider API keys (Resend now; Anthropic/OpenAI later) are **NOT** env vars. They are stored
**encrypted in Postgres** (`email_settings.api_key_enc`, `ai_provider_settings.api_key_enc`)
and resolved at runtime with a **hybrid fallback: WL-specific row → HQ-common row
(`white_label_id IS NULL`)**.

**Why:** spec mandates per-white-label key overrides on top of an HQ-common default, so a
single env var cannot express it. Keys must be editable from the admin UI at runtime.

**How to apply (reuse for AI keys, don't reinvent):**
- Encrypt with the shared `aes-256-gcm` util keyed by the `ENCRYPTION_KEY` **secret** (32-byte
  hex). Stored format is `iv:authTag:ciphertext` (hex). Decryption verifies the auth tag.
- `ENCRYPTION_KEY` is an app-internal secret, not a third-party credential — it still must be
  set via the secrets flow (agents cannot write secrets directly), never via `setEnvVars`.
- Saving keys is **system_admin only** for HQ-common rows; re-verify the role inside the server
  action (admin/service-role client bypasses RLS).
- The hybrid unique indexes are **partial** (`WHERE white_label_id IS NULL` vs `IS NOT NULL`),
  so PostgREST `upsert(onConflict)` can't target them — do select-then-update/insert instead.
- Never return the decrypted key to the client. Settings UI shows only a "registered" flag +
  non-secret fields (from_email/from_name).
- Sending is best-effort: a send failure must NOT roll back the entity it accompanies (e.g.
  invitation stays created, URL shown as fallback). Log the failure server-side.
