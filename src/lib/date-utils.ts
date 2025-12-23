import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'
import { TimePeriod } from '@/types'

export interface DateRange {
    from: Date
    to: Date
}

/**
 * Get date range for this month
 */
export function getThisMonth(): DateRange {
    const now = new Date()
    return {
        from: startOfMonth(now),
        to: endOfMonth(now),
    }
}

/**
 * Get date range for last N months
 */
export function getLastNMonths(n: number): DateRange {
    const now = new Date()
    return {
        from: startOfMonth(subMonths(now, n - 1)),
        to: endOfMonth(now),
    }
}

/**
 * Get date range for this year
 */
export function getThisYear(): DateRange {
    const now = new Date()
    return {
        from: startOfYear(now),
        to: endOfYear(now),
    }
}

/**
 * Get date range for a time period
 */
export function getDateRangeForPeriod(period: TimePeriod, customRange?: DateRange): DateRange | null {
    switch (period) {
        case 'this_month':
            return getThisMonth()
        case 'last_3_months':
            return getLastNMonths(3)
        case 'last_6_months':
            return getLastNMonths(6)
        case 'this_year':
            return getThisYear()
        case 'custom':
            return customRange || null
        case 'all_time':
            return null
        default:
            return null
    }
}

/**
 * Format time period for display
 */
export function formatTimePeriod(period: TimePeriod): string {
    const map: Record<TimePeriod, string> = {
        this_month: 'This Month',
        last_3_months: 'Last 3 Months',
        last_6_months: 'Last 6 Months',
        this_year: 'This Year',
        all_time: 'All Time',
        custom: 'Custom Range',
    }
    return map[period] || period
}
