'use client'
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Trash2 } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { deleteExpense } from '@/app/actions'

export function ExpenseList({ expenses, currentFilter }: { expenses: any[], currentFilter?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    function handleFilterChange(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'All') {
            params.delete('type')
        } else {
            params.set('type', value)
        }
        router.push(`/?${params.toString()}`)
    }

    function handleDateRangeChange(range: DateRange | undefined) {
        setDateRange(range)
        const params = new URLSearchParams(searchParams.toString())

        if (range?.from) {
            params.set('from', range.from.toISOString())
        } else {
            params.delete('from')
        }

        if (range?.to) {
            params.set('to', range.to.toISOString())
        } else {
            params.delete('to')
        }

        router.push(`/?${params.toString()}`)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        setDeletingId(id)
        const result = await deleteExpense(id)

        if (result?.error) {
            alert(result.error)
            setDeletingId(null)
        } else {
            router.refresh()
        }
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.cost), 0)

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between sm:items-center">
                <DateRangePicker
                    dateRange={dateRange}
                    setDateRange={handleDateRangeChange}
                    className="w-full sm:w-auto"
                />
                <Select value={currentFilter || 'All'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Refuel">Refuel</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Wash">Wash</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {expenses.length > 0 && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            RM {totalAmount.toFixed(2)}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenses.map((expense) => (
                    <Card key={expense.id} className="hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pr-12">
                            <CardTitle className="text-sm font-medium text-primary">
                                {expense.type}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(expense.created_at), 'MMM d, yyyy')}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">RM {expense.cost}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {expense.odometer.toLocaleString()} km
                            </p>
                            {expense.notes && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {expense.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {expenses.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12 sm:py-16">
                        <p className="text-base sm:text-lg">No expenses found.</p>
                        <p className="text-xs sm:text-sm mt-2">Add your first expense to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
