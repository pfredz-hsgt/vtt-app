import { createClient } from '@/utils/supabase/server'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { ExpenseList } from '@/components/expense-list'
import { redirect } from 'next/navigation'

export default async function Home({
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <AddExpenseDialog />
      </div>
      <ExpenseList expenses={expenses || []} currentFilter={type} />
    </div>
  )
}
