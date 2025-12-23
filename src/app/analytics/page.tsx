import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

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

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Analytics
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Detailed insights into your spending patterns
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {grandTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(allExpenses || []).length} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Vehicle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">RM {vehicleTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(vehicleExpenses || []).length} expenses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">RM {personalTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(personalExpenses || []).length} expenses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {averageExpense.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            per expense
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Top Spending Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topCategories.map(([category, total], index) => {
                            const percentage = (total / grandTotal) * 100
                            return (
                                <div key={category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{category}</span>
                                        <span className="text-sm text-muted-foreground">
                                            RM {total.toFixed(2)} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Expense Distribution */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Expense Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Vehicle</span>
                                    <span className="text-sm text-muted-foreground">
                                        {vehicleTotal > 0 ? ((vehicleTotal / grandTotal) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${vehicleTotal > 0 ? (vehicleTotal / grandTotal) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Personal</span>
                                    <span className="text-sm text-muted-foreground">
                                        {personalTotal > 0 ? ((personalTotal / grandTotal) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all"
                                        style={{ width: `${personalTotal > 0 ? (personalTotal / grandTotal) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Categories</span>
                                <span className="text-sm font-medium">{Object.keys(categoryTotals).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Highest Expense</span>
                                <span className="text-sm font-medium">
                                    RM {Math.max(...(allExpenses || []).map(e => parseFloat(e.cost)), 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Lowest Expense</span>
                                <span className="text-sm font-medium">
                                    RM {(allExpenses || []).length > 0
                                        ? Math.min(...(allExpenses || []).map(e => parseFloat(e.cost))).toFixed(2)
                                        : '0.00'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
