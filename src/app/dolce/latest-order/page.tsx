'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SpinLoading, ErrorBlock, Button } from 'antd-mobile'
import { supabase } from '@/lib/dolce/supabase'

export default function LatestOrderPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [latestMenu, setLatestMenu] = useState<any>(null)

    useEffect(() => {
        fetchLatestMenu()
    }, [])

    const fetchLatestMenu = async () => {
        try {
            const { data, error } = await supabase
                .from('dolce_menus')
                .select('*')
                .order('menu_date', { ascending: false })
                .limit(1)
                .single()

            if (error) throw error
            setLatestMenu(data)

            // Redirect to the order page for this menu
            if (data) {
                router.push(`/dolce/order/${data.id}`)
            }
        } catch (err) {
            console.error('Error fetching latest menu:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <SpinLoading color='primary' style={{ '--size': '48px' }} />
            </div>
        )
    }

    if (!latestMenu) {
        return (
            <div style={{ padding: '20px' }}>
                <ErrorBlock
                    status='empty'
                    title='No menu available'
                    description='There are no menus created yet. Create one first!'
                />
                <Button
                    block
                    color='primary'
                    onClick={() => router.push('/dolce')}
                    style={{ marginTop: '16px' }}
                >
                    Create Menu
                </Button>
            </div>
        )
    }

    return null
}
