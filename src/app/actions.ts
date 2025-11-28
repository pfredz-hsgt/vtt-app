'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addExpense(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const expenseDate = formData.get('expense_date') as string

    const data = {
        user_id: user.id,
        type: formData.get('type') as string,
        odometer: parseInt(formData.get('odometer') as string),
        cost: parseFloat(formData.get('cost') as string),
        notes: formData.get('notes') as string,
        ...(expenseDate && { created_at: expenseDate }),
    }

    const { error } = await supabase.from('expenses').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteExpense(expenseId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Verify the expense belongs to the user before deleting
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
