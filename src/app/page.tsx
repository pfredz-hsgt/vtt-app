import { createClient } from '@/utils/supabase/server'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { FloatingAddButton } from '@/components/floating-add-button'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Wallet, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all expenses
  const { data: allExpenses } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch vehicle expenses
  const { data: vehicleExpenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('expense_group', 'vehicle')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch personal expenses
  const { data: personalExpenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('expense_group', 'personal')
    .order('created_at', { ascending: false })
    .limit(5)

  const grandTotal = (allExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
  const vehicleTotal = (vehicleExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
  const personalTotal = (personalExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of all your expenses
            </p>
          </div>
          <AddExpenseDialog />
        </div>

        {/* Grand Total Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              RM {grandTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(allExpenses || []).length} total expense{(allExpenses || []).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Split View */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/vehicle">
            <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/40 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  RM {vehicleTotal.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {(vehicleExpenses || []).length} expense{(vehicleExpenses || []).length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/personal">
            <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/40 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Personal Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  RM {personalTotal.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {(personalExpenses || []).length} expense{(personalExpenses || []).length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Expenses */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(allExpenses || []).slice(0, 6).map((expense) => (
              <Card key={expense.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-primary">
                        {expense.type}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {expense.expense_group}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">RM {expense.cost}</div>
                  {expense.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {expense.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <FloatingAddButton />
    </>
  )
}
