'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addExpense(formData: FormData) {
    const supabase = await createClient()

    const expenseDate = formData.get('expense_date') as string
    const expenseGroup = formData.get('expense_group') as string
    const odometerValue = formData.get('odometer') as string

    const data = {
        expense_group: expenseGroup || 'vehicle',
        type: formData.get('type') as string,
        odometer: odometerValue ? parseInt(odometerValue) : null,
        cost: parseFloat(formData.get('cost') as string),
        notes: formData.get('notes') as string || null,
        ...(expenseDate && { created_at: expenseDate }),
    }

    const { error } = await supabase.from('expenses').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/vehicle')
    revalidatePath('/personal')
    return { success: true }
}

export async function deleteExpense(expenseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateExpense(expenseId: string, formData: FormData) {
    const supabase = await createClient()

    const expenseDate = formData.get('expense_date') as string
    const odometerValue = formData.get('odometer') as string

    const data = {
        type: formData.get('type') as string,
        odometer: odometerValue ? parseInt(odometerValue) : null,
        cost: parseFloat(formData.get('cost') as string),
        notes: formData.get('notes') as string || null,
        ...(expenseDate && { created_at: expenseDate }),
    }

    const { error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', expenseId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/vehicle')
    revalidatePath('/personal')
    return { success: true }
}

export async function addRecurringExpense(formData: FormData) {
    const supabase = await createClient()

    const expenseGroup = formData.get('expense_group') as string
    const frequency = formData.get('frequency') as string
    const dayOfMonth = formData.get('day_of_month') as string
    const startDate = formData.get('start_date') as string

    // Calculate next occurrence date
    const start = new Date(startDate)
    let nextOccurrence = new Date(start)

    if (frequency === 'monthly' && dayOfMonth) {
        nextOccurrence.setDate(parseInt(dayOfMonth))
        if (nextOccurrence < start) {
            nextOccurrence.setMonth(nextOccurrence.getMonth() + 1)
        }
    }

    const data = {
        name: formData.get('name') as string,
        amount: parseFloat(formData.get('amount') as string),
        expense_group: expenseGroup || 'personal',
        type: formData.get('type') as string,
        frequency: frequency,
        day_of_month: dayOfMonth ? parseInt(dayOfMonth) : null,
        day_of_week: null, // TODO: Add support for weekly
        start_date: startDate,
        end_date: (formData.get('end_date') as string) || null,
        next_occurrence_date: nextOccurrence.toISOString().split('T')[0],
        notes: (formData.get('notes') as string) || null,
        is_active: true,
    }

    const { error } = await supabase.from('recurring_expenses').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/recurring')
    return { success: true }
}
