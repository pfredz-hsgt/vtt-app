'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/dolce/supabase'
import { parseMenuText } from '@/lib/dolce/utils'
import {
  Button,
  Card,
  TextArea,
  List,
  Switch,
  Toast,
  AutoCenter,
  Space,
  Divider,
  Tag
} from 'antd-mobile'

// Define the shape of our new parser output
type ParsedItem = {
  id: string
  name: string
  price: string
}

type ParsedCategory = {
  category: string
  items: ParsedItem[]
}

export default function HomePage() {
  const router = useRouter()
  const [rawText, setRawText] = useState('')
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0])
  const [isClosed, setIsClosed] = useState(false)

  // State updated to hold structured categories
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([])
  const [loading, setLoading] = useState(false)

  const handleTextChange = (val: string) => {
    setRawText(val)
    // Live preview parsing
    const categories = parseMenuText(val)
    setParsedCategories(categories)
  }

  // Helper to count total items across all categories
  const totalItemsCount = parsedCategories.reduce((acc, cat) => acc + cat.items.length, 0);

  const handleCreateMenu = async () => {
    if (parsedCategories.length === 0) {
      Toast.show({
        icon: 'fail',
        content: 'Please enter a menu first',
      })
      return
    }

    setLoading(true)

    try {
      // 1. Create menu record
      const { data: menuData, error: menuError } = await supabase
        .from('dolce_menus')
        .insert({ menu_date: menuDate, is_closed: isClosed })
        .select()
        .single()

      if (menuError) throw menuError

      // 2. Prepare menu items for bulk insert
      // We need to flatten the categories into a single list for the DB
      // Note: You might want to add a 'category' column to your 'menu_items' table in Supabase
      // so you can group them again when displaying the order page.
      // For now, I will flatten them. If you add a 'category' column, add it here.

      const menuItemsToInsert: any[] = [];

      parsedCategories.forEach(cat => {
        cat.items.forEach(item => {
          menuItemsToInsert.push({
            menu_id: menuData.id,
            item_name: item.name,
            price: parseFloat(item.price.replace('RM', '')), // Convert "RM 8.50" -> 8.50
            category: cat.category // Assuming you added this column. If not, remove this line.
          })
        })
      })

      const { error: itemsError } = await supabase
        .from('dolce_menu_items')
        .insert(menuItemsToInsert)

      if (itemsError) throw itemsError

      Toast.show({
        icon: 'success',
        content: 'Menu created!',
      })

      // Redirect to order page
      router.push(`/dolce/order/${menuData.id}`)
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
          <h1 style={{ margin: '24px 0 8px', fontSize: '28px' }}>🍱 Vendor IOI - Est Dolce</h1>
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
                placeholder="Paste the full WhatsApp menu with prices here..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                style={{ '--font-size': '14px' }}
              />
            </div>
          </div>

          {/* PREVIEW SECTION - UPDATED FOR CATEGORIES */}
          {parsedCategories.length > 0 && (
            <div style={{ background: '#F0F9FF', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 Preview</span>
                <Tag color='primary'>{totalItemsCount} items</Tag>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {parsedCategories.map((cat, catIndex) => (
                  <div key={catIndex}>
                    {/* Category Header */}
                    <div style={{
                      fontWeight: 'bold',
                      color: 'var(--adm-color-primary)',
                      borderBottom: '1px solid #bfdbfe',
                      paddingBottom: '4px',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      {cat.category}
                    </div>

                    {/* Items Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                      {cat.items.map((item, itemIndex) => (
                        <div
                          key={`${catIndex}-${itemIndex}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between', // Push price to right
                            background: '#fff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Optional: Show ID if available */}
                            {item.id && (
                              <span style={{
                                color: '#999',
                                fontSize: '11px',
                                minWidth: '15px'
                              }}>
                                {item.id}.
                              </span>
                            )}
                            <span>{item.name}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: '#059669', fontSize: '12px' }}>
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>
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
            disabled={parsedCategories.length === 0}
          >
            Create Menu
          </Button>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 8px' }}>💡 How it works</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--adm-color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Paste your WhatsApp menu message above</li>
            <li>The app will detect categories (e.g. SET NASI) and prices</li>
            <li>Click "Create Menu" to generate an ordering template</li>
            <li>Share the link with your colleagues via WhatsApp</li>
          </ol>
        </Card>
      </Space>
    </div>
  )
}