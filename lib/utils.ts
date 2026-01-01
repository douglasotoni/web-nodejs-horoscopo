import { getISOWeek, getISOWeekYear } from 'date-fns'

export function getCurrentISOWeek(): { week: number; year: number } {
  const now = new Date()
  return {
    week: getISOWeek(now),
    year: getISOWeekYear(now)
  }
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

