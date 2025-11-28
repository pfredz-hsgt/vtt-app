import { createClient } from '@/utils/supabase/server'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { ExpenseList } from '@/components/expense-list'
import { FloatingAddButton } from '@/components/floating-add-button'
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
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <AddExpenseDialog />
        </div>
        <ExpenseList expenses={expenses || []} currentFilter={type} />
      </div>
      <FloatingAddButton />
    </>
  )
}
