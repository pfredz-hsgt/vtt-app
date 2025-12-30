'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Card, List, Selector, Tag } from 'antd-mobile'
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { ExpenseGroup } from '@/types'
import { getCategories } from '@/lib/expense-categories'

export function ExpenseList({ expenses, currentFilter, expenseGroup }: {
    expenses: any[],
    currentFilter?: string,
    expenseGroup?: ExpenseGroup
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State
    const [editingExpense, setEditingExpense] = useState<any | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    // Get categories based on expense group
    const categories = expenseGroup ? getCategories(expenseGroup) : []
    const showAllCategories = !expenseGroup

    function handleFilterChange(value: string[]) {
        const val = value[0];
        const params = new URLSearchParams(searchParams.toString())
        if (!val || val === 'All') {
            params.delete('type')
        } else {
            params.set('type', val)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    function handleCardClick(expense: any) {
        setEditingExpense(expense)
        setEditDialogOpen(true)
    }

    function handleEditDialogClose() {
        setEditDialogOpen(false)
        router.refresh()
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.cost), 0)

    // Filter options
    const filterOptions = [
        { label: 'All', value: 'All' },
        ...categories.map(c => ({ label: c.name, value: c.name }))
    ];

    return (
        <>
            <div style={{ marginBottom: '16px' }}>
                {!showAllCategories && (
                    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '8px' }}>
                        <Selector
                            options={filterOptions}
                            value={[currentFilter || 'All']}
                            onChange={handleFilterChange}
                            style={{
                                '--border-radius': '100px',
                                '--color': '#f5f5f5',
                                '--checked-color': '#e6f7ff',
                                '--text-color': '#666',
                                '--checked-text-color': '#1677ff',
                                '--padding': '4px 12px'
                            }}
                        />
                    </div>
                )}

                {expenses.length > 0 && (
                    <Card style={{
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #1677ff 0%, #13c2c2 100%)',
                        color: 'white',
                        border: 'none'
                    }}>
                        <div style={{ opacity: 0.9, fontSize: '13px' }}>
                            Total Amount
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                            RM {totalAmount.toFixed(2)}
                        </div>
                        <div style={{ opacity: 0.9, fontSize: '12px', marginTop: '4px' }}>
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                        </div>
                    </Card>
                )}

                <List header='Expenses'>
                    {expenses.map((expense) => (
                        <List.Item
                            key={expense.id}
                            onClick={() => handleCardClick(expense)}
                            prefix={
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    background: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    {expense.expense_group === 'vehicle' ? '🚗' : '👤'}
                                </div>
                            }
                            extra={
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                        RM {expense.cost}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {format(new Date(expense.created_at), 'MMM d')}
                                    </div>
                                </div>
                            }
                            description={
                                <div>
                                    {expense.odometer && (
                                        <Tag color='geekblue' fill='outline' style={{ marginRight: '8px', border: 'none', background: '#f0f5ff' }}>
                                            {expense.odometer.toLocaleString()} km
                                        </Tag>
                                    )}
                                    {expense.notes && <span style={{ fontSize: '12px' }}>{expense.notes}</span>}
                                </div>
                            }
                        >
                            {expense.type}
                        </List.Item>
                    ))}
                </List>

                {expenses.length === 0 && (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
                        <p>No expenses found.</p>
                    </div>
                )}
            </div>

            <EditExpenseDialog
                expense={editingExpense}
                open={editDialogOpen}
                onOpenChange={handleEditDialogClose}
            />
        </>
    )
}
