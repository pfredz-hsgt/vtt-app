'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { FloatingAddButton } from '@/components/floating-add-button'
import { useRouter } from 'next/navigation'
import { Card, Grid, AutoCenter, Button, Space, List, Tag } from 'antd-mobile'
import { Car, Wallet, TrendingUp, ChevronRight } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [allExpenses, setAllExpenses] = useState<any[]>([])
  const [vehicleExpenses, setVehicleExpenses] = useState<any[]>([])
  const [personalExpenses, setPersonalExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchExpenses()
    }
    getUser()
  }, [])

  const fetchExpenses = async () => {
    // Fetch all expenses
    const { data: all } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (all) {
      setAllExpenses(all)
      setVehicleExpenses(all.filter(e => e.expense_group === 'vehicle').slice(0, 5))
      setPersonalExpenses(all.filter(e => e.expense_group === 'personal').slice(0, 5))
    }
    setLoading(false)
  }

  const grandTotal = (allExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
  const vehicleTotal = (vehicleExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)
  const personalTotal = (personalExpenses || []).reduce((sum, exp) => sum + parseFloat(exp.cost), 0)

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
  }

  return (
    <>
      <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', background: 'linear-gradient(to right, #1677ff, #13c2c2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--adm-color-text-secondary)', fontSize: '14px' }}>
              Overview of all your expenses
            </p>
          </div>
          <div style={{ transform: 'scale(0.9)' }}>
            <AddExpenseDialog />
          </div>
        </div>

        {/* Grand Total Card */}
        <Card style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)', border: '1px solid #adc6ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#597ef7' }}>
            <TrendingUp size={16} />
            <span style={{ fontWeight: 500 }}>Total Expenses</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1d39c4' }}>
            RM {grandTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#597ef7', marginTop: '4px' }}>
            {allExpenses.length} total expense{allExpenses.length !== 1 ? 's' : ''}
          </div>
        </Card>

        {/* Split View */}
        <Grid columns={2} gap={12} style={{ marginBottom: '24px' }}>
          <Grid.Item onClick={() => router.push('/vehicle')}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                <Car size={16} />
                <span style={{ fontSize: '13px' }}>Vehicle</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff' }}>
                RM {vehicleTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {vehicleExpenses.length} items
              </div>
            </Card>
          </Grid.Item>

          <Grid.Item onClick={() => router.push('/personal')}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                <Wallet size={16} />
                <span style={{ fontSize: '13px' }}>Personal</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                RM {personalTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {personalExpenses.length} items
              </div>
            </Card>
          </Grid.Item>
        </Grid>

        {/* Integrated Apps */}
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Integrated Apps</h3>
        <Grid columns={2} gap={12} style={{ marginBottom: '24px' }}>
          <Grid.Item onClick={() => router.push('/luncheon')}>
            <Card style={{ height: '100%', cursor: 'pointer', background: '#fff7e6', borderColor: '#ffd591' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍱</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#d46b08' }}>Luncheon</span>
              </div>
              <div style={{ fontSize: '13px', color: '#d46b08' }}>
                Order Lunch
              </div>
            </Card>
          </Grid.Item>

          <Grid.Item onClick={() => router.push('/dolce')}>
            <Card style={{ height: '100%', cursor: 'pointer', background: '#fff0f6', borderColor: '#ffadd2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>☕</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#c41d7f' }}>Dolce</span>
              </div>
              <div style={{ fontSize: '13px', color: '#c41d7f' }}>
                Coffee & Snacks
              </div>
            </Card>
          </Grid.Item>
        </Grid>

        {/* Recent Expenses */}
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Recent Expenses</h3>
        <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
          {allExpenses.slice(0, 6).map((expense) => (
            <List.Item
              key={expense.id}
              prefix={
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  {expense.expense_group === 'vehicle' ? '🚗' : '👤'}
                </div>
              }
              extra={
                <span style={{ fontWeight: 600, color: '#333' }}>
                  RM {expense.cost}
                </span>
              }
              description={expense.notes || expense.expense_group}
            >
              {expense.type}
            </List.Item>
          ))}
        </List>
      </div>
      <FloatingAddButton />
    </>
  )
}
