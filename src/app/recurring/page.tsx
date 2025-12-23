import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { RecurringExpenseList } from '@/components/recurring-expense-list'
import { AddRecurringExpenseDialog } from '@/components/add-recurring-expense-dialog'

export default async function RecurringPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: recurringExpenses } = await supabase
        .from('recurring_expenses')
        .select('*')
        .order('next_occurrence_date', { ascending: true })

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Recurring Expenses
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your recurring expenses like loans, subscriptions, and regular payments
                    </p>
                </div>
                <AddRecurringExpenseDialog />
            </div>

            <RecurringExpenseList recurringExpenses={recurringExpenses || []} />
        </div>
    )
}
