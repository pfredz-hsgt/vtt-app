'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/luncheon/supabase'
import {
    List,
    Card,
    Tag,
    SpinLoading,
    ErrorBlock,
    Button,
    AutoCenter,
    SwipeAction,
    Modal
} from 'antd-mobile'

export default function HistoryPage() {
    const router = useRouter()
    const [menus, setMenus] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [menuToDelete, setMenuToDelete] = useState<string | null>(null)

    useEffect(() => {
        fetchMenus()
    }, [])

    const fetchMenus = async () => {
        try {
            const { data, error } = await supabase
                .from('luncheon_menus')
                .select(`
          *,
          orders:luncheon_orders(count)
        `)
                .order('menu_date', { ascending: false })

            if (error) throw error
            setMenus(data || [])
        } catch (err) {
            console.error('Error fetching menus:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ms-MY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleDeleteMenu = (menuId: string) => {
        console.log('Delete clicked for menu:', menuId)
        setMenuToDelete(menuId)
    }

    const confirmDelete = async () => {
        if (!menuToDelete) return

        console.log('Confirming delete for menu:', menuToDelete)

        try {
            const { error, data } = await supabase
                .from('luncheon_menus')
                .delete()
                .eq('id', menuToDelete)
                .select()

            console.log('Delete response:', { error, data })

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            // Update local state
            setMenus(prev => prev.filter(menu => menu.id !== menuToDelete))
            console.log('Menu deleted successfully!')
        } catch (err: any) {
            console.error('Error deleting menu:', err)
            alert('Failed to delete menu: ' + (err.message || 'Unknown error'))
        } finally {
            setMenuToDelete(null)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <SpinLoading color='primary' style={{ '--size': '48px' }} />
            </div>
        )
    }

    return (
        <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
            <AutoCenter>
                <h1 style={{ margin: '16px 0 8px', fontSize: '24px' }}>📜 Menu History</h1>
                <p style={{ color: 'var(--adm-color-text-secondary)', margin: '0 0 24px' }}>View and manage past menus. Swipe left to delete.</p>
            </AutoCenter>

            {menus.length > 0 ? (
                <Card bodyStyle={{ padding: 0 }}>
                    <List>
                        {menus.map((menu) => (
                            <SwipeAction
                                key={menu.id}
                                rightActions={[
                                    {
                                        key: 'delete',
                                        text: 'Delete',
                                        color: 'danger',
                                        onClick: () => handleDeleteMenu(menu.id),
                                    },
                                ]}
                            >
                                <List.Item
                                    onClick={() => router.push(`/luncheon/summary/${menu.id}`)}
                                    prefix={
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#EFF6FF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--adm-color-primary)'
                                        }}>
                                            <Calendar size={20} />
                                        </div>
                                    }
                                    description={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span>{menu.orders?.[0]?.count || 0} orders</span>
                                            <Tag
                                                color={menu.is_closed ? 'danger' : 'success'}
                                                fill='outline'
                                                style={{ '--border-radius': '4px' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {menu.is_closed ? <Lock size={12} /> : <Unlock size={12} />}
                                                    {menu.is_closed ? 'Closed' : 'Open'}
                                                </div>
                                            </Tag>
                                        </div>
                                    }
                                    arrow
                                >
                                    <span style={{ fontWeight: 500 }}>{formatDate(menu.menu_date)}</span>
                                </List.Item>
                            </SwipeAction>
                        ))}
                    </List>
                </Card>
            ) : (
                <div style={{ padding: '20px' }}>
                    <ErrorBlock
                        status='empty'
                        title='No menus found'
                        description='Create your first menu to get started'
                    />
                    <Button
                        block
                        color='primary'
                        onClick={() => router.push('/luncheon/create')}
                        style={{ marginTop: '16px' }}
                    >
                        Create Menu
                    </Button>
                </div>
            )}

            <Modal
                visible={menuToDelete !== null}
                content='Are you sure you want to delete this menu? This will also delete all associated orders.'
                closeOnAction
                onClose={() => setMenuToDelete(null)}
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
