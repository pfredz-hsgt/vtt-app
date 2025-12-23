'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { addExpense } from '@/app/actions'
import { ExpenseGroup } from '@/types'
import { getCategories } from '@/lib/expense-categories'

interface AddExpenseDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultGroup?: ExpenseGroup
}

export function AddExpenseDialog({ open: controlledOpen, onOpenChange, defaultGroup = 'vehicle' }: AddExpenseDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>(defaultGroup)

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const categories = getCategories(expenseGroup)
    const isVehicle = expenseGroup === 'vehicle'

    async function handleSubmit(formData: FormData) {
        if (date) {
            formData.append('expense_date', date.toISOString())
        }
        formData.append('expense_group', expenseGroup)

        const result = await addExpense(formData)
        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            setDate(new Date())
            setExpenseGroup(defaultGroup)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!controlledOpen && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add Expense
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription>
                        Record a new {expenseGroup} expense here.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expense_group" className="text-right">
                            Type
                        </Label>
                        <Select
                            value={expenseGroup}
                            onValueChange={(value) => setExpenseGroup(value as ExpenseGroup)}
                        >
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
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <div className="col-span-3">
                            <DatePicker date={date} setDate={setDate} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Category
                        </Label>
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

                    {isVehicle && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="odometer" className="text-right">
                                Odometer
                            </Label>
                            <Input
                                id="odometer"
                                name="odometer"
                                type="number"
                                className="col-span-3"
                                placeholder="km"
                                required={isVehicle}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right">
                            Cost
                        </Label>
                        <Input
                            id="cost"
                            name="cost"
                            type="number"
                            step="0.01"
                            className="col-span-3"
                            placeholder="RM"
                            required
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
                        <Button type="submit">Save Expense</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
