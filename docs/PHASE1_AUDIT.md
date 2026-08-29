# Phase 1 — Production Audit (read-only)

Date: 2026-08-29. Scope: verification of the 12 reported issues against the codebase and the
production database (read-only queries; no writes, no schema changes, no deployments).

## TL;DR

1. **The planning is empty since 2026-08-02.** All recurring schedules were generated on
   2026-06-28 with recurrence end `2026-08-02`; occurrences are materialized up-front and nothing
   extends them. Zero classes exist after July 29 while signups continued through August.
   If this is not an intentional closure, it is the most urgent operational problem.
2. **Capacity violations are confirmed in production**: 4 schedules over capacity, including
   CrossBike 2026-06-24 with 13 confirmed bookings for 12 bikes. Extra bookings landed minutes to
   days after the class was full — there is no effective server-side invariant. The
   `current_bookings` counter drifts (5 schedules currently wrong, both directions).
3. **Abonnement credit loss is systemic and explained**: admin class cancellation/deletion refunds
   `credits_remaining + 1` for every plan type, but abonnement bookings were charged on
   `weekly_credits_used`, which is never restored. Phantom `credits_remaining` on abonnement
   subscriptions are the fossil record (Amal 6, Nesma 4, Med Amine Amor 5; 27 users affected).
   8 of 11 logged admin weekly-credit corrections are manual −1 compensations, including Amal at
   11/10 (above her own weekly limit) on 2026-01-13.
4. **The production service-role key is committed to git** (`.env.production`), together with the
   Wasender API key. Rotation + removal required (coordinated with Vercel env vars).
5. **Password reset and "JWT expired" share one root**: reset emails are generated (Amine Amor:
   `recovery_sent_at 2026-08-24`, account healthy) but the PKCE `?code` exchange only works in the
   browser that requested the reset — cross-device/webview opens fail into
   `/forgot-password?error=invalid_link`, which the form never displays. Sessions live 9–11 months
   on refresh tokens (PWA); stale access tokens surface raw "JWT expired" PostgREST errors.

## Bug verification matrix

| # | Issue | Verified? | Root cause | Severity |
|---|-------|-----------|------------|----------|
| 1 | Password reset | Confirmed (mechanism) | PKCE code exchange is device-bound; errors invisible on the form | High |
| 2 | Cannot leave waitlist | Confirmed (code defect) | Browser-side delete+refund, all errors swallowed, success toast regardless; RLS silently blocks (policy dump pending) | High |
| 3 | Credits not restored | **Confirmed** | Wrong-field refunds on admin class deletion; non-atomic legacy cancel; unsafe waitlist-leave paths; admin promotion double-charge | **Critical** |
| 4 | Waitlist position | Already displayed | Accuracy at risk: stored positions maintained by triggers AND client loops | Medium |
| 5 | Expiration notification | Absent (confirmed) | Not implemented; only channel is WhatsApp (59% failure on some flows) | Medium |
| 6 | Redesign | Awaiting direction choice | Token-based mono design; re-skin is low-risk once approved | — |
| 7 | Capacity exceeded | **Confirmed (4 violations)** | No atomic enforcement; drifting counter trusted; admin promote/force-promote overbook | **Critical** |
| 8 | No-show system | Partially in schema | `no_show` status exists; no flagging UI/penalty logic | Planned |
| 9 | Amal has no credits | Not reproducible today | Active sub to 2027-01-08, 0/10 weekly used; historical losses = issue 3; empty August planning likely triggered the report | Explained |
| 10 | Etoo cannot join waitlist | Explained (identity to confirm) | Counter under-count makes full classes look non-full: booking refused as full, waitlist refused as "not full"; likely user: Ito ouhafsa | High |
| 11 | JWT expired | Confirmed (mechanism) | Months-old PWA sessions + browser-side DB calls; raw error strings shown | High |
| 12 | Amine Amor | Confirmed (account healthy) | Same person as "Mohammed Amine" (to confirm); failure is issue 1 + 11, not data corruption | High |

## Key production risks

- Service-role + Wasender keys committed in `.env.production` (critical — rotate).
- No credit ledger: balances are mutable counters without history.
- 59% of class-cancellation WhatsApp messages failed silently (416/707).
- Test accounts (Testsalma, Karimtest, Test lk) book real classes, consumed a CrossBike slot.
- ~30 DB functions/triggers/policies exist only in production; repo has 3 migrations; code/DB drift.
- Cancellation rules inconsistent: code 3h, settings 24h/1h, UI text 3h.
- No automated tests exist.

## Proposed plan (pending approval)

0. Access + ops: production Supabase access (function bodies, RLS, pg_cron, auth config/logs);
   decide September schedules; rotate leaked keys; handle test accounts.
1. Data integrity (issues 7, 3): one atomic SQL layer for book/cancel/join/leave/promote with row
   locks and real counts; type-aware credit movements; append-only credit ledger; counter
   recomputation; migrate all app paths; regression tests incl. concurrent booking.
2. Auth (1, 11, 12): token_hash recovery flow; visible errors; central JWT-expired
   refresh/retry/logout handling.
3. Waitlist (2, 4, 10): server-side join/leave transaction; dynamic positions; UI uses real counts.
4. Features (5, 8): idempotent expiration notification (J−7, Africa/Casablanca); no-show system
   after business rules confirmed.
5. Redesign (6): only after a direction is approved.

## Open questions

1. Grant Supabase access (connect project or run provided read-only SQL dump).
2. Empty August planning: intentional? Create September schedules?
3. Confirm identities: Etoo = Ito ouhafsa? Mohammed Amine = Amine Amor = Med Amine AMOR?
4. Business rules: cancellation deadline; waitlist credit-at-join; no-show details; notification
   channel/timing.
5. Approve key rotation and `.env.production` removal.
6. Choose design direction A (Atelier), B (Cadence) or C (Charbon).
