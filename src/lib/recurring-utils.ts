import { RecurringExpense, RecurringFrequency } from '@/types'
import { addDays, addWeeks, addMonths, addYears, setDate, isBefore, isAfter, startOfDay } from 'date-fns'

/**
 * Calculate the next occurrence date for a recurring expense
 */
export function calculateNextOccurrence(
    recurring: RecurringExpense,
    fromDate: Date = new Date()
): Date | null {
    const baseDate = recurring.last_generated_date
        ? new Date(recurring.last_generated_date)
        : new Date(recurring.start_date)

    let nextDate: Date

    switch (recurring.frequency) {
        case 'monthly':
            nextDate = addMonths(baseDate, 1)
            if (recurring.day_of_month) {
                nextDate = setDate(nextDate, Math.min(recurring.day_of_month, 28)) // Avoid invalid dates
            }
            break

        case 'weekly':
            nextDate = addWeeks(baseDate, 1)
            break

        case 'yearly':
            nextDate = addYears(baseDate, 1)
            break

        default:
            return null
    }

    // Check if next date is beyond end date
    if (recurring.end_date && isAfter(nextDate, new Date(recurring.end_date))) {
        return null
    }

    return nextDate
}

/**
 * Generate a list of upcoming occurrence dates for preview
 */
export function generateUpcomingDates(
    recurring: RecurringExpense,
    count: number = 3
): Date[] {
    const dates: Date[] = []
    let currentRecurring = { ...recurring }

    for (let i = 0; i < count; i++) {
        const nextDate = calculateNextOccurrence(currentRecurring)
        if (!nextDate) break

        dates.push(nextDate)
        currentRecurring = {
            ...currentRecurring,
            last_generated_date: nextDate.toISOString(),
        }
    }

    return dates
}

/**
 * Check if a recurring expense is due (should generate an expense entry)
 */
export function isRecurringDue(recurring: RecurringExpense, today: Date = new Date()): boolean {
    if (!recurring.is_active) return false

    const startDate = new Date(recurring.start_date)
    const todayStart = startOfDay(today)

    // Not started yet
    if (isBefore(todayStart, startOfDay(startDate))) {
        return false
    }

    // Already ended
    if (recurring.end_date && isAfter(todayStart, new Date(recurring.end_date))) {
        return false
    }

    const nextOccurrence = calculateNextOccurrence(recurring, today)
    if (!nextOccurrence) return false

    // Due if next occurrence is today or in the past
    return !isAfter(startOfDay(nextOccurrence), todayStart)
}

/**
 * Get all recurring expenses that are due and need to generate expense entries
 */
export function getDueRecurringExpenses(
    recurringExpenses: RecurringExpense[],
    today: Date = new Date()
): RecurringExpense[] {
    return recurringExpenses.filter(recurring => isRecurringDue(recurring, today))
}

/**
 * Calculate how many occurrences have been missed
 */
export function getMissedOccurrences(recurring: RecurringExpense, today: Date = new Date()): number {
    if (!recurring.is_active) return 0

    const lastGenerated = recurring.last_generated_date
        ? new Date(recurring.last_generated_date)
        : new Date(recurring.start_date)

    let count = 0
    let currentDate = lastGenerated
    const todayStart = startOfDay(today)

    // Count how many times we should have generated
    while (true) {
        const nextDate = calculateNextOccurrence({
            ...recurring,
            last_generated_date: currentDate.toISOString(),
        })

        if (!nextDate || isAfter(startOfDay(nextDate), todayStart)) {
            break
        }

        count++
        currentDate = nextDate

        // Safety limit to prevent infinite loops
        if (count > 1000) break
    }

    return count
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: RecurringFrequency): string {
    const map: Record<RecurringFrequency, string> = {
        monthly: 'Monthly',
        weekly: 'Weekly',
        yearly: 'Yearly',
    }
    return map[frequency] || frequency
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek] || 'Unknown'
}

/**
 * Format recurring schedule for display
 */
export function formatRecurringSchedule(recurring: RecurringExpense): string {
    const freq = formatFrequency(recurring.frequency)

    if (recurring.frequency === 'monthly' && recurring.day_of_month) {
        return `${freq} on day ${recurring.day_of_month}`
    }

    if (recurring.frequency === 'weekly' && recurring.day_of_week !== null && recurring.day_of_week !== undefined) {
        return `${freq} on ${getDayName(recurring.day_of_week)}`
    }

    return freq
}
