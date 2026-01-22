import { createClient } from '@/utils/supabase/server'
import { ExpenseList } from '@/components/expense-list'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { FloatingAddButton } from '@/components/floating-add-button'


export default async function VehiclePage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; from?: string; to?: string }>
}) {
    const supabase = await createClient()

    const { type, from, to } = await searchParams

    let query = supabase
        .from('expenses')
        .select('*')
        .eq('expense_group', 'vehicle')
        .order('created_at', { ascending: false })

    if (type && type !== 'All') {
        query = query.eq('type', type)
    }

    const { data: expenses } = await query

    return (
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #1677ff, #13c2c2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 4px 0'
                }}>
                    Vehicle Expenses
                </h1>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Track and manage your vehicle expenses
                </p>
            </div>

            <div className="hidden sm:block" style={{ marginBottom: '16px' }}>
                <AddExpenseDialog defaultGroup="vehicle" />
            </div>

            <ExpenseList expenses={expenses || []} currentFilter={type} expenseGroup="vehicle" />
            <FloatingAddButton defaultGroup="vehicle" />
        </div>
    )
}
