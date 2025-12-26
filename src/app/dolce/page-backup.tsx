'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { parseMenuText } from '@/lib/utils'
import {
  Button,
  Card,
  TextArea,
  List,
  Switch,
  Toast,
  AutoCenter,
  Space,
  Divider
} from 'antd-mobile'

export default function HomePage() {
  const router = useRouter()
  const [rawText, setRawText] = useState('')
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0])
  const [isClosed, setIsClosed] = useState(false)
  const [parsedItems, setParsedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleTextChange = (val: string) => {
    setRawText(val)
    // Live preview parsing
    const items = parseMenuText(val)
    setParsedItems(items)
  }

  const handleCreateMenu = async () => {
    if (parsedItems.length === 0) {
      Toast.show({
        icon: 'fail',
        content: 'Please enter a menu first',
      })
      return
    }

    setLoading(true)

    try {
      // Create menu record
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .insert({ menu_date: menuDate, is_closed: isClosed })
        .select()
        .single()

      if (menuError) throw menuError

      // Create menu items
      const menuItems = parsedItems.map(item => ({
        menu_id: menuData.id,
        item_name: item
      }))

      const { error: itemsError } = await supabase
        .from('menu_items')
        .insert(menuItems)

      if (itemsError) throw itemsError

      Toast.show({
        icon: 'success',
        content: 'Menu created!',
      })

      // Redirect to order page
      router.push(`/order/${menuData.id}`)
    } catch (err: any) {
      console.error('Error creating menu:', err)
      Toast.show({
        icon: 'fail',
        content: err.message || 'Failed to create menu',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <Space direction='vertical' block style={{ '--gap': '24px' }}>
        <AutoCenter>
          <h1 style={{ margin: '24px 0 8px', fontSize: '28px' }}>🍱 Luncheon Order</h1>
          <p style={{ color: 'var(--adm-color-text-secondary)', margin: 0 }}>
            Create today's menu from WhatsApp message
          </p>
        </AutoCenter>

        <Card>
          <List header='Menu Details'>
            <List.Item
              prefix={<Calendar size={20} color='var(--adm-color-primary)' />}
              extra={
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  style={{
                    border: '1px solid #eee',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                />
              }
            >
              Menu Date
            </List.Item>

            <List.Item
              prefix={
                isClosed ?
                  <Lock size={20} color='var(--adm-color-danger)' /> :
                  <Unlock size={20} color='var(--adm-color-success)' />
              }
              extra={
                <Switch
                  checked={isClosed}
                  onChange={setIsClosed}
                  style={{
                    '--checked-color': 'var(--adm-color-danger)',
                  }}
                />
              }
              description={isClosed ? 'Orders are closed' : 'Orders are open'}
            >
              Order Status
            </List.Item>
          </List>

          <Divider />

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 500 }}>
              <FileText size={20} color='var(--adm-color-primary)' />
              <span>Paste WhatsApp Menu</span>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
              <TextArea
                value={rawText}
                onChange={handleTextChange}
                placeholder="Assalamualaikum..&#10;&#10;Rumah Makan Nek Chik menyediakan...&#10;&#10;Menu&#10;&#10;Daging sambal ijo&#10;Ikan kembung masak lemak&#10;..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                style={{ '--font-size': '14px' }}
              />
            </div>
          </div>

          {parsedItems.length > 0 && (
            <div style={{ background: '#F0F9FF', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
                📋 Preview ({parsedItems.length} items)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {parsedItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#fff',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--adm-color-primary)',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            block
            color='primary'
            size='large'
            onClick={handleCreateMenu}
            loading={loading}
            disabled={parsedItems.length === 0}
          >
            Create Menu & Get Order Link
          </Button>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 8px' }}>💡 How it works</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--adm-color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Paste your WhatsApp menu message above</li>
            <li>The app will automatically extract menu items</li>
            <li>Set the date and order status</li>
            <li>Click "Create Menu" to generate a shareable order link</li>
            <li>Share the link with your colleagues via WhatsApp</li>
          </ol>
        </Card>
      </Space>
    </div>
  )
}
