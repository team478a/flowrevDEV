---
name: Client invitation flow (FlowRev)
description: How WL-owner client onboarding works and why it is split into create vs accept phases
---

# Client invitation flow

Spec §10-2 / §11-7 / §14-1 mandate an INVITATION onboarding (not direct client creation):
WL owner creates an invitation → invitee registers via `/register?token=` → becomes
`client_owner`, a `clients` row is created, invitation `status` → `accepted`.

## Decisions
- Built in two phases. Phase A (done): create invitation + show shareable invite URL.
  Phase B (next): `/register?token=` acceptance flow.
  **Why:** email (Resend) is not connected yet, so the invite URL is shown for manual
  sharing instead of emailed. Email send (`/api/invite`) is deferred until Resend exists.
- Invitation repository uses the RLS session client (`lib/supabase/server`), NOT the
  admin client. **Why:** `invitations` RLS already scopes `white_label_owner` to their own
  tenant (USING doubles as WITH CHECK on the FOR ALL policy), so RLS is the security
  boundary; admin client would bypass it. Pages still call `requireWhiteLabelOwner()` as
  defense-in-depth.
- Token = `randomBytes(32).toString("hex")` (64 hex), 7-day `expires_at` (§14-1).
- Invite URL requires `NEXT_PUBLIC_APP_URL`; action throws if unset (never emit a relative
  URL for an externally-shared link).
- Do NOT SELECT `token` in list queries — only needed when building the URL at creation.

## Phase B (done): `/register?token=` acceptance
Auth-user creation (Supabase Auth API) and the DB writes (clients/invitations) cannot share
one SQL transaction, so the flow is **compensation-based**, not atomic:
order = createUser → claimInvitation → createClient; on any later failure, delete the user
and revert the invitation.

**Why / hard-won rules:**
- Double-acceptance is prevented by making the claim itself the atomic gate: a single UPDATE
  `status='accepted' WHERE token AND status='pending' AND expires_at > now()`, then check the
  returned row count (`.select('id')`, length > 0). A plain validate-then-update has a race
  window — fold validation INTO the claiming UPDATE.
- Every compensation call (deleteUser, revert invitation, delete orphan client) MUST inspect
  its error and emit an audit log on failure — a failed `deleteUser` leaves a stray
  `client_owner` (access-control risk), not just a data blemish. Never swallow compensation errors.
- clients/invitations writes use the admin (service-role) client: a brand-new client_owner has
  no RLS rights to insert clients or update invitations.
