'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ShoppingCart, MessageSquare, Lock } from 'lucide-react'
import { supabase } from '@/lib/luncheon/supabase'
import QuantityPicker from '@/components/luncheon/QuantityPicker'
import {
    Button,
    Card,
    Input,
    TextArea,
    Toast,
    AutoCenter,
    SpinLoading,
    ErrorBlock,
    Space,
    List
} from 'antd-mobile'

export default function OrderPage() {
    const router = useRouter()
    const params = useParams()
    const menuId = params.menuId as string

    const [menu, setMenu] = useState<any>(null)
    const [menuItems, setMenuItems] = useState<any[]>([])
    const [customerName, setCustomerName] = useState('')
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [remarks, setRemarks] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (menuId) {
            fetchMenu()
        }
    }, [menuId])

    const fetchMenu = async () => {
        try {
            // Fetch menu
            const { data: menuData, error: menuError } = await supabase
                .from('luncheon_menus')
                .select('*')
                .eq('id', menuId)
                .single()

            if (menuError) throw menuError
            setMenu(menuData)

            // Fetch menu items
            const { data: itemsData, error: itemsError } = await supabase
                .from('luncheon_menu_items')
                .select('*')
                .eq('menu_id', menuId)

            if (itemsError) throw itemsError
            setMenuItems(itemsData)

            // Initialize quantities
            const initialQuantities: Record<string, number> = {}
            itemsData.forEach((item: any) => {
                initialQuantities[item.item_name] = 0
            })
            setQuantities(initialQuantities)
        } catch (err: any) {
            console.error('Error fetching menu:', err)
            setError(err.message || 'Failed to load menu')
        } finally {
            setLoading(false)
        }
    }

    const handleQuantityChange = (itemName: string, value: number) => {
        setQuantities(prev => ({
            ...prev,
            [itemName]: value
        }))
    }

    const handleSubmit = async () => {
        if (!customerName.trim()) {
            Toast.show({ icon: 'fail', content: 'Please enter your name' })
            return
        }

        const hasItems = Object.values(quantities).some(qty => qty > 0)
        if (!hasItems) {
            Toast.show({ icon: 'fail', content: 'Please select at least one item' })
            return
        }

        setSubmitting(true)
        setError('')

        try {
            // Create order
            const { data: orderData, error: orderError } = await supabase
                .from('luncheon_orders')
                .insert({
                    menu_id: menuId,
                    customer_name: customerName.trim(),
                    remarks: remarks.trim() || null,
                    is_paid: false
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order details
            const orderDetails = Object.entries(quantities)
                .filter(([_, qty]) => qty > 0)
                .map(([itemName, qty]) => ({
                    order_id: orderData.id,
                    item_name: itemName,
                    quantity: qty
                }))

            const { error: detailsError } = await supabase
                .from('luncheon_order_details')
                .insert(orderDetails)

            if (detailsError) throw detailsError

            // Show success and reset form
            alert('Order submitted successfully!')
            setCustomerName('')
            setRemarks('')
            const resetQuantities: Record<string, number> = {}
            menuItems.forEach(item => {
                resetQuantities[item.item_name] = 0
            })
            setQuantities(resetQuantities)

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' })

        } catch (err: any) {
            console.error('Error submitting order:', err)
            alert('Failed to submit order: ' + (err.message || 'Unknown error'))
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <SpinLoading color='primary' style={{ '--size': '48px' }} />
            </div>
        )
    }

    if (error && !menu) {
        return (
            <div style={{ padding: '20px' }}>
                <ErrorBlock
                    status='default'
                    title='Unable to Load Menu'
                    description={error}
                />
                <Button block color='primary' onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
                    Retry
                </Button>
            </div>
        )
    }

    if (!menu) {
        return (
            <div style={{ padding: '20px' }}>
                <ErrorBlock status='empty' title='Menu not found' />
                <Button block color='primary' onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
                    Retry
                </Button>
            </div>
        )
    }

    const menuDateStr = new Date(menu.menu_date).toLocaleDateString('ms-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
            <AutoCenter>
                <h1 style={{ margin: '16px 0 8px', fontSize: '24px' }}>🍱 Lunch Order</h1>
                <p style={{ color: 'var(--adm-color-text-secondary)', margin: '0 0 8px' }}>{menuDateStr}</p>
            </AutoCenter>

            {!menu.is_closed && (
                <Button
                    block
                    color='success'
                    onClick={() => router.push(`/luncheon/summary/${menuId}`)}
                    style={{ marginBottom: '24px' }}
                >
                    View Order Summary
                </Button>
            )}

            {menu.is_closed ? (
                <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <Lock size={48} color='var(--adm-color-danger)' style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ margin: '0 0 8px', color: 'var(--adm-color-danger)' }}>Orders are already closed ⛔</h3>
                    <p style={{ color: 'var(--adm-color-text-secondary)' }}>You can no longer submit orders for this menu 😢 </p>
                    <Button
                        block
                        color='primary'
                        onClick={() => router.push(`/luncheon/summary/${menuId}`)}
                        style={{ marginTop: '24px' }}
                    >
                        View Order Summary
                    </Button>
                    <Button
                        block
                        color='warning'
                        onClick={() => router.push(`/luncheon/create`)}
                        style={{ marginTop: '16px' }}
                    >
                        Create New Order
                    </Button>
                </Card>
            ) : (
                <Space direction='vertical' block style={{ '--gap': '2px' }}>
                    <Card title='Nama Pelanggan'>
                        <Input
                            placeholder='Masukkan nama anda di sini'
                            value={customerName}
                            onChange={setCustomerName}
                            clearable
                            style={{
                                '--font-size': '16px',
                                border: '1px solid var(--adm-color-border)',
                                borderRadius: '8px',
                                padding: '8px'
                            }}
                        />
                    </Card>

                    <Card title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                            <ShoppingCart size={20} color='var(--adm-color-primary)' />
                            <span>Pilih Menu Makanan</span>
                        </div>
                    } bodyStyle={{ padding: 0 }}>
                        {menuItems.map((item) => (
                            <QuantityPicker
                                key={item.id}
                                itemName={item.item_name}
                                value={quantities[item.item_name] || 0}
                                onChange={(value: number) => handleQuantityChange(item.item_name, value)}
                            />
                        ))}
                    </Card>

                    <Card title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={20} color='var(--adm-color-primary)' />
                            <span>Catatan / Remarks</span>
                        </div>
                    }>
                        <TextArea
                            placeholder='Nasi Separuh, Ayam Thigh, Kuah Kari Lebih'
                            value={remarks}
                            onChange={setRemarks}
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Card>

                    <Button
                        block
                        color='primary'
                        size='large'
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        Submit Order
                    </Button>
                </Space>
            )}
        </div>
    )
}
