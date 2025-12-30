import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all expenses for analytics
    const { data: allExpenses } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

    const { data: vehicleExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('expense_group', 'vehicle')

    const { data: personalExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('expense_group', 'personal')

    // Calculate totals
    const grandTotal = (allExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
    const vehicleTotal = (vehicleExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
    const personalTotal = (personalExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
    const averageExpense = (allExpenses || []).length > 0
        ? grandTotal / (allExpenses || []).length
        : 0

    // Category breakdown
    const categoryTotals = (allExpenses || []).reduce((acc, exp) => {
        acc[exp.type] = (acc[exp.type] || 0) + parseFloat(exp.cost)
        return acc
    }, {} as Record<string, number>)

    return (
        <AnalyticsDashboard
            grandTotal={grandTotal}
            vehicleTotal={vehicleTotal}
            personalTotal={personalTotal}
            averageExpense={averageExpense}
            categoryTotals={categoryTotals}
            totalTransactionCount={(allExpenses || []).length}
            vehicleTransactionCount={(vehicleExpenses || []).length}
            personalTransactionCount={(personalExpenses || []).length}
            allExpenses={allExpenses || []}
        />
    )
}
