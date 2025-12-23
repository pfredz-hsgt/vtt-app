'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ExpenseGroup, RecurringFrequency } from '@/types'
import { getCategories } from '@/lib/expense-categories'
import { addRecurringExpense } from '@/app/actions'
import { useRouter } from 'next/navigation'

export function AddRecurringExpenseDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>('personal')
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')

    const categories = getCategories(expenseGroup)

    async function handleSubmit(formData: FormData) {
        formData.append('expense_group', expenseGroup)
        formData.append('frequency', frequency)

        const result = await addRecurringExpense(formData)
        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Recurring
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Recurring Expense</DialogTitle>
                    <DialogDescription>
                        Set up an expense that repeats automatically
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            className="col-span-3"
                            placeholder="e.g., Car Loan, Netflix"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <Select value={expenseGroup} onValueChange={(v) => setExpenseGroup(v as ExpenseGroup)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vehicle">Vehicle</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Category</Label>
                        <Select name="type" required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            className="col-span-3"
                            placeholder="RM"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Frequency</Label>
                        <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {frequency === 'monthly' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="day_of_month" className="text-right">
                                Day of Month
                            </Label>
                            <Input
                                id="day_of_month"
                                name="day_of_month"
                                type="number"
                                min="1"
                                max="28"
                                className="col-span-3"
                                placeholder="1-28"
                                required
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start_date" className="text-right">
                            Start Date
                        </Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            className="col-span-3"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end_date" className="text-right">
                            End Date
                        </Label>
                        <Input
                            id="end_date"
                            name="end_date"
                            type="date"
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <Input
                            id="notes"
                            name="notes"
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Recurring Expense</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
