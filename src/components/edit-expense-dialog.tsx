'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { updateExpense, deleteExpense } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { getCategories, getExpenseGroup } from '@/lib/expense-categories'

interface EditExpenseDialogProps {
    expense: {
        id: string
        type: string
        expense_group?: string
        odometer?: number | null
        cost: number
        notes?: string | null
        created_at: string
    } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditExpenseDialog({ expense, open, onOpenChange }: EditExpenseDialogProps) {
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [type, setType] = useState<string>('')

    useEffect(() => {
        if (expense) {
            setDate(new Date(expense.created_at))
            setType(expense.type)
        }
    }, [expense])

    async function handleSubmit(formData: FormData) {
        if (!expense) return

        if (date) {
            formData.append('expense_date', date.toISOString())
        }
        const result = await updateExpense(expense.id, formData)
        if (result?.error) {
            alert(result.error)
        } else {
            onOpenChange(false)
            router.refresh()
        }
    }

    async function handleDelete() {
        if (!expense) return

        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        const result = await deleteExpense(expense.id)
        if (result?.error) {
            alert(result.error)
        } else {
            onOpenChange(false)
            router.refresh()
        }
    }

    if (!expense) return null

    // Determine expense group from the expense type
    const expenseGroup = expense.expense_group || getExpenseGroup(expense.type)
    const categories = getCategories(expenseGroup as 'vehicle' | 'personal')
    const isVehicle = expenseGroup === 'vehicle'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>
                        Update your {expenseGroup} expense details.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-date" className="text-right">
                            Date
                        </Label>
                        <div className="col-span-3">
                            <DatePicker date={date} setDate={setDate} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right">
                            Category
                        </Label>
                        <Select name="type" value={type} onValueChange={setType} required>
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
                            <Label htmlFor="edit-odometer" className="text-right">
                                Odometer
                            </Label>
                            <Input
                                id="edit-odometer"
                                name="odometer"
                                type="number"
                                defaultValue={expense.odometer || ''}
                                className="col-span-3"
                                placeholder="km"
                                required={isVehicle}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-cost" className="text-right">
                            Cost
                        </Label>
                        <Input
                            id="edit-cost"
                            name="cost"
                            type="number"
                            step="0.01"
                            defaultValue={expense.cost}
                            className="col-span-3"
                            placeholder="RM"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-notes" className="text-right">
                            Notes
                        </Label>
                        <Input
                            id="edit-notes"
                            name="notes"
                            defaultValue={expense.notes || ''}
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
