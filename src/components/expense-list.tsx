'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
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
import { DateRangePicker } from "@/components/date-range-picker"

export function ExpenseList({ expenses, currentFilter }: { expenses: any[], currentFilter?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

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

    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.cost), 0)

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <DateRangePicker
                    dateRange={dateRange}
                    setDateRange={handleDateRangeChange}
                />
                <Select value={currentFilter || 'All'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px]">
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
                <Card className="bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">RM {totalAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expenses.map((expense) => (
                    <Card key={expense.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {expense.type}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(expense.created_at), 'MMM d, yyyy')}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">RM {expense.cost}</div>
                            <p className="text-xs text-muted-foreground">
                                {expense.odometer} km
                            </p>
                            {expense.notes && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {expense.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {expenses.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        No expenses found.
                    </div>
                )}
            </div>
        </div>
    )
}
