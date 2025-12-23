import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ExpenseList } from '@/components/expense-list'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { FloatingAddButton } from '@/components/floating-add-button'

export default async function VehiclePage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; from?: string; to?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { type, from, to } = await searchParams

    let query = supabase
        .from('expenses')
        .select('*')
        .eq('expense_group', 'vehicle')
        .order('created_at', { ascending: false })

    if (type && type !== 'All') {
        query = query.eq('type', type)
    }

    if (from) {
        query = query.gte('created_at', from)
    }

    if (to) {
        query = query.lte('created_at', to)
    }

    const { data: expenses } = await query

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Vehicle Expenses
                    </h1>
                    <AddExpenseDialog defaultGroup="vehicle" />
                </div>
                <ExpenseList expenses={expenses || []} currentFilter={type} expenseGroup="vehicle" />
            </div>
            <FloatingAddButton defaultGroup="vehicle" />
        </>
    )
}
