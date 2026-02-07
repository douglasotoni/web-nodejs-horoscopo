import { getISOWeek, getISOWeekYear } from 'date-fns'
import type { Weekday } from '@prisma/client'

const WEEKDAY_ORDER: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function getCurrentISOWeek(): { week: number; year: number } {
  const now = new Date()
  return {
    week: getISOWeek(now),
    year: getISOWeekYear(now)
  }
}

/** Retorna o dia da semana atual no formato do enum Prisma (1 = segunda, 7 = domingo em ISO) */
export function getCurrentWeekday(): Weekday {
  const now = new Date()
  const day = now.getDay() // 0 = domingo, 1 = segunda, ...
  const isoDay = day === 0 ? 7 : day // ISO: 1 = segunda, 7 = domingo
  return WEEKDAY_ORDER[isoDay - 1]
}

/** De uma data (YYYY-MM-DD) ou null, retorna date, weekday, isoWeek e isoYear. Se dateStr for null/vazio, usa hoje. */
export function parseDateToContext(dateStr: string | null): { date: Date; weekday: Weekday; isoWeek: number; isoYear: number } {
  const date = !dateStr || dateStr.trim() === ''
    ? new Date()
    : (() => {
        const [y, m, d] = dateStr.split('-').map(Number)
        if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return new Date()
        const parsed = new Date(y, m - 1, d)
        if (isNaN(parsed.getTime())) return new Date()
        return parsed
      })()
  const weekday = getWeekdayFromDate(date)
  const { week: isoWeek, year: isoYear } = getISOWeekFromDate(date)
  return { date, weekday, isoWeek, isoYear }
}

function getWeekdayFromDate(date: Date): Weekday {
  const day = date.getDay()
  const isoDay = day === 0 ? 7 : day
  return WEEKDAY_ORDER[isoDay - 1]
}

export function getISOWeekFromDate(date: Date): { week: number; year: number } {
  return {
    week: getISOWeek(date),
    year: getISOWeekYear(date)
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

