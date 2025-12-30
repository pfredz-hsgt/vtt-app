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
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #1677ff, #13c2c2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 4px 0'
                    }}>
                        Recurring Expenses
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        Manage your recurring expenses
                    </p>
                </div>
                <AddRecurringExpenseDialog />
            </div>

            <RecurringExpenseList recurringExpenses={recurringExpenses || []} />
        </div>
    )
}
