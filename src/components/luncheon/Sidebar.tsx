'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, History, Menu, ChefHat, ShoppingCart, ClipboardList } from 'lucide-react'
import { Popup, List, Button } from 'antd-mobile'

export default function Sidebar() {
    const [visible, setVisible] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { name: 'Create Menu', icon: Home, href: '/luncheon/create' },
        { name: 'Order', icon: ShoppingCart, href: '/luncheon/latest-order' },
        { name: 'Summary', icon: ClipboardList, href: '/luncheon/latest-summary' },
        { name: 'Menu History', icon: History, href: '/luncheon/history' },
    ]

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '12px',
                left: '12px',
                zIndex: 100
            }}>
                <Button
                    onClick={() => setVisible(true)}
                    style={{
                        padding: '8px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <Menu size={24} color='var(--adm-color-text)' />
                </Button>
            </div>

            <Popup
                visible={visible}
                onMaskClick={() => setVisible(false)}
                position='left'
                bodyStyle={{ width: '280px', height: '100vh', background: '#fff' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <ChefHat size={28} color='var(--adm-color-primary)' style={{ marginRight: '12px' }} />
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Luncheon</span>
                    </div>

                    <div style={{ flex: 1, padding: '16px 0' }}>
                        <List mode='card'>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <List.Item
                                        key={item.href}
                                        prefix={<item.icon size={20} color={isActive ? '#fff' : 'var(--adm-color-text-secondary)'} />}
                                        onClick={() => {
                                            router.push(item.href)
                                            setVisible(false)
                                        }}
                                        style={isActive ? {
                                            background: 'var(--adm-color-primary)',
                                            '--active-background-color': 'var(--adm-color-primary)'
                                        } : {}}
                                    >
                                        <span style={{
                                            color: isActive ? '#fff' : 'var(--adm-color-text)',
                                            fontWeight: isActive ? 500 : 400
                                        }}>
                                            {item.name}
                                        </span>
                                    </List.Item>
                                )
                            })}
                        </List>
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--adm-color-text-secondary)' }}>
                            v1.0.0 • Luncheon App
                        </p>
                    </div>
                </div>
            </Popup>
        </>
    )
}
