'use client'

import { Card, Tag, Button, List } from 'antd-mobile'
import { Calendar, Edit, Pause, Play, Trash2 } from 'lucide-react'
import { RecurringExpense } from '@/types'
import { formatRecurringSchedule, calculateNextOccurrence } from '@/lib/recurring-utils'
import { getCategoryColor } from '@/lib/expense-categories'
import { format } from 'date-fns'

interface RecurringExpenseListProps {
    recurringExpenses: RecurringExpense[]
}

export function RecurringExpenseList({ recurringExpenses }: RecurringExpenseListProps) {
    const activeExpenses = recurringExpenses.filter(re => re.is_active)
    const pausedExpenses = recurringExpenses.filter(re => !re.is_active)

    if (recurringExpenses.length === 0) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                <Calendar style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#999' }} />
                <p style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px' }}>No recurring expenses yet</p>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Add your first recurring expense to automate your expense tracking
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {activeExpenses.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', paddingLeft: '4px' }}>Active ({activeExpenses.length})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                        {activeExpenses.map((recurring) => (
                            <RecurringExpenseCard key={recurring.id} recurring={recurring} />
                        ))}
                    </div>
                </div>
            )}

            {pausedExpenses.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', paddingLeft: '4px', color: '#999' }}>
                        Paused ({pausedExpenses.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
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

    // Using antd-mobile Card with custom styles to match the vibe
    return (
        <Card style={{
            opacity: recurring.is_active ? 1 : 0.6,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {recurring.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag color={recurring.expense_group === 'vehicle' ? 'primary' : 'success'} style={{ '--border-radius': '4px', padding: '0 6px' }}>
                            {recurring.expense_group}
                        </Tag>
                        <span>• {recurring.type}</span>
                    </div>
                </div>
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: categoryColor,
                        marginTop: '6px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>RM {recurring.amount.toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    {formatRecurringSchedule(recurring)}
                </div>
            </div>

            <div style={{
                borderTop: '1px solid #f0f0f0',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {nextDate && recurring.is_active ? (
                    <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#999' }}>Next: </span>
                        <span style={{ fontWeight: 500 }}>{format(nextDate, 'MMM d, yyyy')}</span>
                    </div>
                ) : <div></div>}

                <div style={{ display: 'flex', gap: '4px' }}>
                    <Button fill='none' size='small' style={{ padding: '4px 8px' }}>
                        <Edit size={16} color='#666' />
                    </Button>
                    <Button fill='none' size='small' style={{ padding: '4px 8px' }}>
                        {recurring.is_active ? (
                            <Pause size={16} color='#666' />
                        ) : (
                            <Play size={16} color='#666' />
                        )}
                    </Button>
                    <Button fill='none' size='small' style={{ padding: '4px 8px' }}>
                        <Trash2 size={16} color='#ff4d4f' />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
