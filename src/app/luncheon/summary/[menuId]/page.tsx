'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Copy, Plus, Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/luncheon/supabase'
import { formatOrdersForWhatsApp, copyToClipboard } from '@/lib/luncheon/utils'
import OrderCard from '@/components/luncheon/OrderCard'
import {
    Button,
    Card,
    Grid,
    Space,
    Modal,
    AutoCenter,
    SpinLoading,
    ErrorBlock
} from 'antd-mobile'

export default function SummaryPage() {
    const router = useRouter()
    const params = useParams()
    const menuId = params.menuId as string

    const [menu, setMenu] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [copying, setCopying] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

    useEffect(() => {
        if (menuId) {
            fetchData()
        }
    }, [menuId])

    const fetchData = async () => {
        try {
            // Fetch menu
            const { data: menuData, error: menuError } = await supabase
                .from('luncheon_menus')
                .select('*')
                .eq('id', menuId)
                .single()

            if (menuError) throw menuError
            setMenu(menuData)

            // Fetch orders with details
            const { data: ordersData, error: ordersError } = await supabase
                .from('luncheon_orders')
                .select(`
          *,
          luncheon_order_details(*)
        `)
                .eq('menu_id', menuId)
                .order('created_at', { ascending: true })

            if (ordersError) throw ordersError
            setOrders(ordersData || [])
        } catch (err) {
            console.error('Error fetching data:', err)
            alert('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePaid = async (orderId: string, isPaid: boolean) => {
        try {
            const { error } = await supabase
                .from('luncheon_orders')
                .update({ is_paid: isPaid })
                .eq('id', orderId)

            if (error) throw error

            // Update local state
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? { ...order, is_paid: isPaid } : order
                )
            )
        } catch (err) {
            console.error('Error updating order:', err)
            alert('Failed to update payment status')
        }
    }

    const handleDeleteOrder = (orderId: string) => {
        setOrderToDelete(orderId)
    }

    const confirmDelete = async () => {
        if (!orderToDelete) return

        try {
            const { error } = await supabase
                .from('luncheon_orders')
                .delete()
                .eq('id', orderToDelete)

            if (error) throw error

            // Update local state
            setOrders(prev => prev.filter(order => order.id !== orderToDelete))
            console.log('Order deleted successfully')
        } catch (err) {
            console.error('Error deleting order:', err)
            alert('Failed to delete order')
        } finally {
            setOrderToDelete(null)
        }
    }

    const handleCopyToWhatsApp = async () => {
        setCopying(true)
        const text = formatOrdersForWhatsApp(orders, menu.menu_date)
        const success = await copyToClipboard(text)

        if (success) {
            alert('Copied to clipboard!')
        } else {
            alert('Failed to copy')
        }

        setCopying(false)
    }

    const toggleOrderStatus = async () => {
        try {
            const newStatus = !menu.is_closed
            const { error } = await supabase
                .from('luncheon_menus')
                .update({ is_closed: newStatus })
                .eq('id', menuId)

            if (error) throw error

            setMenu((prev: any) => ({ ...prev, is_closed: newStatus }))
            alert(newStatus ? 'Orders closed' : 'Orders opened')
        } catch (err) {
            console.error('Error updating menu status:', err)
            alert('Failed to update status')
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <SpinLoading color='primary' style={{ '--size': '48px' }} />
            </div>
        )
    }

    if (!menu) {
        return (
            <div style={{ padding: '20px' }}>
                <ErrorBlock status='empty' title='Menu not found' description='Please check the link and try again' />
            </div>
        )
    }

    const menuDateStr = new Date(menu.menu_date).toLocaleDateString('ms-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const totalOrders = orders.length
    const paidOrders = orders.filter(o => o.is_paid).length

    return (
        <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <AutoCenter>
                <h1 style={{ margin: '16px 0 8px', fontSize: '24px' }}>📋 Order Summary</h1>
                <p style={{ color: 'var(--adm-color-text-secondary)', margin: '0 0 24px' }}>{menuDateStr}</p>
            </AutoCenter>

            <Grid columns={2} gap={16} style={{ marginBottom: '24px' }}>
                <Grid.Item>
                    <Card style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--adm-color-primary)' }}>{totalOrders}</div>
                        <div style={{ color: 'var(--adm-color-text-secondary)', fontSize: '14px' }}>Total Orders</div>
                    </Card>
                </Grid.Item>
                <Grid.Item>
                    <Card style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--adm-color-success)' }}>{paidOrders}</div>
                        <div style={{ color: 'var(--adm-color-text-secondary)', fontSize: '14px' }}>Paid</div>
                    </Card>
                </Grid.Item>
            </Grid>

            <Space direction='vertical' block style={{ marginBottom: '24px' }}>
                <Button
                    block
                    color='primary'
                    fill='outline'
                    onClick={() => router.push(`/luncheon/order/${menuId}`)}
                >
                    <Space>
                        <Plus size={20} />
                        <span>Add Order</span>
                    </Space>
                </Button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        block
                        color={menu.is_closed ? 'success' : 'danger'}
                        onClick={toggleOrderStatus}
                    >
                        <Space>
                            {menu.is_closed ? <Unlock size={20} /> : <Lock size={20} />}
                            <span>{menu.is_closed ? 'Open Orders' : 'Close Orders'}</span>
                        </Space>
                    </Button>

                    <Button
                        block
                        color='primary'
                        onClick={handleCopyToWhatsApp}
                        disabled={copying || orders.length === 0}
                    >
                        <Space>
                            <Copy size={20} />
                            <span>{copying ? 'Copying...' : 'Copy-Whatsapp'}</span>
                        </Space>
                    </Button>
                </div>
            </Space>

            {orders.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onDelete={handleDeleteOrder}
                            onTogglePaid={handleTogglePaid}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
                    <h3 style={{ margin: '0 0 8px' }}>No orders yet</h3>
                    <p style={{ color: 'var(--adm-color-text-secondary)', marginBottom: '24px' }}>Share the order link to start collecting orders</p>
                    <Button
                        color='primary'
                        onClick={() => {
                            const orderLink = `${window.location.origin}/luncheon/latest-order`
                            copyToClipboard(orderLink)
                            alert('Order link copied!')
                        }}
                    >
                        Copy Order Link
                    </Button>
                </div>
            )}

            <Modal
                visible={orderToDelete !== null}
                content='Are you sure you want to delete this order?'
                closeOnAction
                onClose={() => setOrderToDelete(null)}
                actions={[
                    {
                        key: 'cancel',
                        text: 'Cancel',
                    },
                    {
                        key: 'delete',
                        text: 'Delete',
                        danger: true,
                        onClick: confirmDelete,
                    },
                ]}
            />
        </div>
    )
}
