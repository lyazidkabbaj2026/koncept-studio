/**
 * The studio's clock — one place, used everywhere a member sees a time.
 *
 * Class times are stored as absolute instants. Turning one back into "17:30"
 * needs an offset, and the app used to take it from whatever machine was
 * looking: the member's device when rendering, the admin's device when
 * creating a schedule, UTC inside server actions. That is why one class could
 * show three different times.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS DOES NOT NAME A TIMEZONE
 *
 * The obvious fix — format everything with timeZone: 'Africa/Casablanca' — is
 * not enough, and the first version of this file learned that the hard way.
 * A zone name is resolved from whatever copy of the IANA database the runtime
 * carries, and those copies disagree after a rule change: on 2026-09-20,
 * production Postgres, the Node runtime (tz 2025c) and plenty of member
 * phones still placed Morocco at UTC+1 while the country had moved to UTC+0.
 *
 * A correction applied *relative* to the zone cannot fix that, because the
 * amount to correct differs per device: a phone with stale rules needs -60, a
 * phone with current rules needs 0, and a single build-time constant is wrong
 * for one of them either way.
 *
 * So this module never asks any runtime what Africa/Casablanca means. It
 * shifts the instant by an offset the studio states outright, then formats in
 * UTC — which every runtime renders identically, because UTC needs no rules.
 * The result is the same on every device, always.
 *
 * THE COST: automatic Ramadan and DST handling is gone. When Morocco changes
 * its clocks, someone has to change this number. That is the trade this app
 * needs — the platforms lag the country by weeks, and a wrong class time is
 * worse than a manual edit twice a year.
 *
 * TO CHANGE IT: set NEXT_PUBLIC_STUDIO_UTC_OFFSET in Vercel to the studio's
 * offset from UTC, in minutes, and redeploy (it is inlined at build time).
 *   Morocco standard (UTC+1) ....  60
 *   Morocco during Ramadan  ....   0
 *   Morocco since Sept 2026 ....    0   <- current, and the default below
 * ---------------------------------------------------------------------------
 */

/** Kept for display and for logging only — never used to resolve a time. */
export const STUDIO_TZ_LABEL = 'Africa/Casablanca'

export const STUDIO_UTC_OFFSET_MINUTES = (() => {
  const raw = process.env.NEXT_PUBLIC_STUDIO_UTC_OFFSET
  if (raw === undefined || raw === '') return 0
  const parsed = Number(raw)
  // A typo would move every displayed time, so refuse anything that is not a
  // sane whole-minute offset rather than silently shifting the timetable.
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || Math.abs(parsed) > 840) {
    console.error(`Ignoring invalid NEXT_PUBLIC_STUDIO_UTC_OFFSET: ${raw} — falling back to UTC+0`)
    return 0
  }
  return parsed
})()

/** The instant, moved so that reading it as UTC gives the studio's wall clock. */
function shifted(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value)
  return new Date(d.getTime() + STUDIO_UTC_OFFSET_MINUTES * 60_000)
}

function studioFormat(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  // timeZone: 'UTC' is the point — it is the one zone every runtime agrees on.
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(shifted(value))
}

/** "17:30" — the time the class actually starts, at the studio. */
export function formatStudioTime(value: string | Date): string {
  return studioFormat(value, { hour: '2-digit', minute: '2-digit' })
}

/** "lundi 21 septembre 2026" */
export function formatStudioDate(value: string | Date): string {
  return studioFormat(value, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

/** "lundi 21 septembre" — for messages where the year is noise. */
export function formatStudioDayMonth(value: string | Date): string {
  return studioFormat(value, { weekday: 'long', day: '2-digit', month: 'long' })
}

/** "lun. 21 sept. 2026" — compact, for dense tables. */
export function formatStudioShortDate(value: string | Date): string {
  return studioFormat(value, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

/** "21 septembre 2026" — no weekday, for subscription dates. */
export function formatStudioLongDate(value: string | Date): string {
  return studioFormat(value, { day: '2-digit', month: 'long', year: 'numeric' })
}

/** "21/09/2026 à 17:30" */
export function formatStudioDateTime(value: string | Date): string {
  return `${studioFormat(value, { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${formatStudioTime(value)}`
}

/**
 * "Now", as a Date whose LOCAL components read as the studio's wall clock.
 *
 * Comparisons like `now >= sundayAt17` are written against a Date's local
 * getters, so they only mean "17:00 at the studio" if `now` carries the
 * studio's wall clock. This is what decides when the Sunday and Wednesday
 * booking windows open, and it must not vary by device.
 *
 * The returned Date is a stand-in for comparing wall clocks, not a real
 * instant: do not send it to the database or subtract it from a real Date.
 */
export function studioNow(): Date {
  const d = shifted(new Date())
  return new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()
  )
}
