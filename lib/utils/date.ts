import { format, parseISO, isValid, addDays, startOfWeek, endOfWeek, isSameDay, isPast, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'

// Date format constants
export const DATE_FORMATS = {
  FULL_DATE: 'EEEE d MMMM yyyy',
  DATE: 'd MMMM yyyy',
  SHORT_DATE: 'dd/MM/yyyy',
  TIME: 'HH:mm',
  DATE_TIME: 'd MMMM yyyy à HH:mm',
  SHORT_DATE_TIME: 'dd/MM/yyyy HH:mm',
  DAY_MONTH: 'd MMM',
  WEEKDAY: 'EEEE',
  MONTH_YEAR: 'MMMM yyyy'
} as const

/**
 * Safely parse a date from various input types
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null

  if (date instanceof Date) {
    return isValid(date) ? date : null
  }

  try {
    const parsed = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Safely format a date with fallback
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = DATE_FORMATS.DATE,
  fallback: string = '-'
): string {
  const parsedDate = parseDate(date)
  if (!parsedDate) return fallback

  try {
    return format(parsedDate, formatStr, { locale: fr })
  } catch {
    return fallback
  }
}

/**
 * Common date formatting functions
 */
export const dateUtils = {
  // Full date formats
  formatFullDate: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.FULL_DATE),

  formatDate: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.DATE),

  formatShortDate: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.SHORT_DATE),

  // Time formats
  formatTime: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.TIME),

  formatDateTime: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.DATE_TIME),

  formatShortDateTime: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.SHORT_DATE_TIME),

  // Relative formats
  formatDayMonth: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.DAY_MONTH),

  formatWeekday: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.WEEKDAY),

  formatMonthYear: (date: string | Date | null | undefined) =>
    formatDate(date, DATE_FORMATS.MONTH_YEAR),

  // Date comparisons
  isPastDate: (date: string | Date | null | undefined): boolean => {
    const parsedDate = parseDate(date)
    return parsedDate ? isPast(parsedDate) : false
  },

  isFutureDate: (date: string | Date | null | undefined): boolean => {
    const parsedDate = parseDate(date)
    return parsedDate ? isFuture(parsedDate) : false
  },

  isSameDate: (date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean => {
    const parsed1 = parseDate(date1)
    const parsed2 = parseDate(date2)
    return parsed1 && parsed2 ? isSameDay(parsed1, parsed2) : false
  },

  // Date manipulations
  addDays: (date: string | Date, days: number): Date | null => {
    const parsedDate = parseDate(date)
    return parsedDate ? addDays(parsedDate, days) : null
  },

  getWeekStart: (date: string | Date | null | undefined): Date | null => {
    const parsedDate = parseDate(date)
    return parsedDate ? startOfWeek(parsedDate, { weekStartsOn: 1 }) : null
  },

  getWeekEnd: (date: string | Date | null | undefined): Date | null => {
    const parsedDate = parseDate(date)
    return parsedDate ? endOfWeek(parsedDate, { weekStartsOn: 1 }) : null
  },

  // Business logic helpers
  formatClassDateTime: (date: string | Date | null | undefined, duration?: number): string => {
    const parsedDate = parseDate(date)
    if (!parsedDate) return '-'

    const dateStr = formatDate(parsedDate, DATE_FORMATS.DATE)
    const timeStr = formatDate(parsedDate, DATE_FORMATS.TIME)

    if (duration) {
      const endTime = formatDate(addDays(parsedDate, duration / (24 * 60)), DATE_FORMATS.TIME)
      return `${dateStr} de ${timeStr} à ${endTime}`
    }

    return `${dateStr} à ${timeStr}`
  },

  formatScheduleTime: (startTime: string | Date | null | undefined, endTime?: string | Date | null | undefined): string => {
    const start = formatDate(startTime, DATE_FORMATS.TIME)
    if (endTime) {
      const end = formatDate(endTime, DATE_FORMATS.TIME)
      return `${start} - ${end}`
    }
    return start
  }
}

export default dateUtils