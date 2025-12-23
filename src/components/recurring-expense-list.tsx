'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Edit, Pause, Play, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecurringExpense } from '@/types'
import { formatRecurringSchedule, calculateNextOccurrence } from '@/lib/recurring-utils'
import { getCategoryColor } from '@/lib/expense-categories'

interface RecurringExpenseListProps {
    recurringExpenses: RecurringExpense[]
}

export function RecurringExpenseList({ recurringExpenses }: RecurringExpenseListProps) {
    const activeExpenses = recurringExpenses.filter(re => re.is_active)
    const pausedExpenses = recurringExpenses.filter(re => !re.is_active)

    if (recurringExpenses.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No recurring expenses yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Add your first recurring expense to automate your expense tracking
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {activeExpenses.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3">Active ({activeExpenses.length})</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activeExpenses.map((recurring) => (
                            <RecurringExpenseCard key={recurring.id} recurring={recurring} />
                        ))}
                    </div>
                </div>
            )}

            {pausedExpenses.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                        Paused ({pausedExpenses.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pausedExpenses.map((recurring) => (
                            <RecurringExpenseCard key={recurring.id} recurring={recurring} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function RecurringExpenseCard({ recurring }: { recurring: RecurringExpense }) {
    const categoryColor = getCategoryColor(recurring.type)
    const nextDate = recurring.next_occurrence_date
        ? new Date(recurring.next_occurrence_date)
        : calculateNextOccurrence(recurring)

    return (
        <Card className={`${!recurring.is_active && 'opacity-60'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold line-clamp-1">
                            {recurring.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            {recurring.type} • {recurring.expense_group}
                        </p>
                    </div>
                    <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: categoryColor }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <div className="text-2xl font-bold">RM {recurring.amount.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        {formatRecurringSchedule(recurring)}
                    </p>
                </div>

                {nextDate && recurring.is_active && (
                    <div className="text-sm">
                        <span className="text-muted-foreground">Next: </span>
                        <span className="font-medium">{format(nextDate, 'MMM d, yyyy')}</span>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                        {recurring.is_active ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
