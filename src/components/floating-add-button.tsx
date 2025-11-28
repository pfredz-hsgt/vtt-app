'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/add-expense-dialog'

export function FloatingAddButton() {
    const [isVisible, setIsVisible] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    return (
        <>
            <Button
                onClick={() => setDialogOpen(true)}
                size="lg"
                className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 sm:h-auto sm:w-auto sm:rounded-full sm:px-6 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
                    }`}
            >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
            </Button>

            {dialogOpen && (
                <AddExpenseDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                />
            )}
        </>
    )
}
