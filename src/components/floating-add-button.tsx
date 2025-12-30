'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { ExpenseGroup } from '@/types'
import { Button } from 'antd-mobile'

interface FloatingAddButtonProps {
    defaultGroup?: ExpenseGroup
}

export function FloatingAddButton({ defaultGroup = 'vehicle' }: FloatingAddButtonProps = {}) {
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <>
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
                <Button
                    color='primary'
                    shape='rounded'
                    style={{
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)'
                    }}
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus size={24} />
                </Button>
            </div>

            <AddExpenseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultGroup={defaultGroup}
            />
        </>
    )
}
