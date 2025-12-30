'use client'

import { Card, Grid, ProgressBar } from 'antd-mobile'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

interface AnalyticsDashboardProps {
    grandTotal: number
    vehicleTotal: number
    personalTotal: number
    averageExpense: number
    categoryTotals: Record<string, number>
    totalTransactionCount: number
    vehicleTransactionCount: number
    personalTransactionCount: number
    allExpenses: any[]
}

export function AnalyticsDashboard({
    grandTotal,
    vehicleTotal,
    personalTotal,
    averageExpense,
    categoryTotals,
    totalTransactionCount,
    vehicleTransactionCount,
    personalTransactionCount,
    allExpenses
}: AnalyticsDashboardProps) {
    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)

    return (
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #1677ff, #13c2c2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 4px 0'
                }}>
                    Analytics
                </h1>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Detailed insights into your spending patterns
                </p>
            </div>

            {/* Summary Cards */}
            <Grid columns={2} gap={12} style={{ marginBottom: '16px' }}>
                <Grid.Item>
                    <Card style={{ height: '100%' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            Total Expenses
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>RM {grandTotal.toFixed(2)}</div>
                        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
                            {totalTransactionCount} transactions
                        </p>
                    </Card>
                </Grid.Item>

                <Grid.Item>
                    <Card style={{ height: '100%' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            Vehicle
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff' }}>RM {vehicleTotal.toFixed(2)}</div>
                        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
                            {vehicleTransactionCount} expenses
                        </p>
                    </Card>
                </Grid.Item>

                <Grid.Item>
                    <Card style={{ height: '100%' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            Personal
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>RM {personalTotal.toFixed(2)}</div>
                        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
                            {personalTransactionCount} expenses
                        </p>
                    </Card>
                </Grid.Item>

                <Grid.Item>
                    <Card style={{ height: '100%' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            Average
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>RM {averageExpense.toFixed(2)}</div>
                        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
                            per expense
                        </p>
                    </Card>
                </Grid.Item>
            </Grid>


            {/* Top Categories */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                    <PieChart size={20} />
                    Top Spending Categories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {topCategories.map(([category, total]) => {
                        const percentage = ((total as number) / grandTotal) * 100
                        return (
                            <div key={category}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                    <span style={{ fontWeight: 500 }}>{category}</span>
                                    <span style={{ color: '#666' }}>
                                        RM {(total as number).toFixed(2)} ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <ProgressBar percent={percentage} style={{ '--track-color': '#f0f0f0', '--fill-color': '#1677ff' }} />
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Expense Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                        <BarChart3 size={20} />
                        Expense Distribution
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                <span style={{ fontWeight: 500 }}>Vehicle</span>
                                <span style={{ color: '#666' }}>
                                    {vehicleTotal > 0 ? ((vehicleTotal / grandTotal) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <ProgressBar
                                percent={vehicleTotal > 0 ? (vehicleTotal / grandTotal) * 100 : 0}
                                style={{ '--track-color': '#f0f0f0', '--fill-color': '#1677ff' }}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                <span style={{ fontWeight: 500 }}>Personal</span>
                                <span style={{ color: '#666' }}>
                                    {personalTotal > 0 ? ((personalTotal / grandTotal) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <ProgressBar
                                percent={personalTotal > 0 ? (personalTotal / grandTotal) * 100 : 0}
                                style={{ '--track-color': '#f0f0f0', '--fill-color': '#52c41a' }}
                            />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                        <TrendingUp size={20} />
                        Quick Stats
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#666' }}>Total Categories</span>
                            <span style={{ fontWeight: 500 }}>{Object.keys(categoryTotals).length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#666' }}>Highest Expense</span>
                            <span style={{ fontWeight: 500 }}>
                                RM {Math.max(...(allExpenses || []).map(e => parseFloat(e.cost)), 0).toFixed(2)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: '#666' }}>Lowest Expense</span>
                            <span style={{ fontWeight: 500 }}>
                                RM {(allExpenses || []).length > 0
                                    ? Math.min(...(allExpenses || []).map(e => parseFloat(e.cost))).toFixed(2)
                                    : '0.00'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
