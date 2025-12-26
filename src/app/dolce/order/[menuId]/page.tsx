'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ShoppingCart, MessageSquare, Lock, Truck, MapPin, Phone } from 'lucide-react'
import { supabase } from '@/lib/dolce/supabase'
import QuantityPicker from '@/components/dolce/QuantityPicker'
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
  Tag,
  Switch,
  List
} from 'antd-mobile'

export default function OrderPage() {
  const router = useRouter()
  const params = useParams()
  const menuId = params.menuId as string

  const [menu, setMenu] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])

  // Form States - Using refs for text inputs to avoid re-renders
  const customerNameRef = useRef<any>(null)
  const remarksRef = useRef<any>(null)
  const addressRef = useRef<any>(null)
  const phoneRef = useRef<any>(null)

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isDelivery, setIsDelivery] = useState(false) // New: COD State

  // UI States
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
        .from('dolce_menus')
        .select('*')
        .eq('id', menuId)
        .single()

      if (menuError) throw menuError
      setMenu(menuData)

      // Fetch menu items - ORDER BY CREATED_AT ASCENDING
      const { data: itemsData, error: itemsError } = await supabase
        .from('dolce_menu_items')
        .select('*')
        .eq('menu_id', menuId)
        .order('created_at', { ascending: true }) // Crucial for maintaining parsed order

      if (itemsError) throw itemsError
      setMenuItems(itemsData)

      // Initialize quantities
      const initialQuantities: Record<string, number> = {}
      itemsData.forEach((item: any) => {
        initialQuantities[item.id] = 0
      })
      setQuantities(initialQuantities)
    } catch (err: any) {
      console.error('Error fetching menu:', err)
      setError(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  // 2. UPDATE GROUPING LOGIC
  // This logic preserves the order of categories as they appear in the list
  const groupedItems = useMemo(() => {
    // We use a Map to preserve insertion order of categories
    const groups = new Map<string, any[]>();

    menuItems.forEach(item => {
      const cat = item.category || 'General Menu';

      if (!groups.has(cat)) {
        groups.set(cat, []);
      }

      const categoryItems = groups.get(cat);
      if (categoryItems) {
        categoryItems.push(item);
      }
    });

    // Convert Map back to array of [key, value] for rendering
    return Array.from(groups.entries());
  }, [menuItems]);

  // Delivery fee constant
  const DELIVERY_FEE = 3.00;

  // Calculate totals
  const itemTotal = useMemo(() => {
    return Object.entries(quantities).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(i => i.id.toString() === itemId);
      if (item && qty > 0) {
        return sum + (item.price * qty);
      }
      return sum;
    }, 0);
  }, [quantities, menuItems]);

  const grandTotal = useMemo(() => {
    return itemTotal + (isDelivery ? DELIVERY_FEE : 0);
  }, [itemTotal, isDelivery]);

  const handleQuantityChange = useCallback((itemId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: value
    }))
  }, [])

  const handleDeliveryToggle = useCallback((checked: boolean) => {
    setIsDelivery(checked)
  }, [])

  const handleSubmit = async () => {
    // Get values from refs
    const customerName = customerNameRef.current?.nativeElement?.value || ''
    const remarks = remarksRef.current?.nativeElement?.value || ''
    const address = addressRef.current?.nativeElement?.value || ''
    const phone = phoneRef.current?.nativeElement?.value || ''

    // Validation
    if (!customerName.trim()) {
      Toast.show({ icon: 'fail', content: 'Please enter your name' })
      return
    }

    if (isDelivery) {
      if (!address.trim()) {
        Toast.show({ icon: 'fail', content: 'Please enter delivery address' })
        return
      }
      if (!phone.trim()) {
        Toast.show({ icon: 'fail', content: 'Please enter phone number' })
        return
      }
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
        .from('dolce_orders')
        .insert({
          menu_id: menuId,
          customer_name: customerName.trim(),
          remarks: remarks.trim() || null,
          is_paid: false,
          // New Fields
          is_delivery: isDelivery,
          delivery_address: isDelivery ? address.trim() : null,
          phone_number: isDelivery ? phone.trim() : null,
          total_amount: grandTotal
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order details
      const orderDetails = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, qty]) => {
          const originalItem = menuItems.find(i => i.id.toString() === itemId);
          return {
            order_id: orderData.id,
            item_name: originalItem?.item_name || 'Unknown Item',
            quantity: qty,
            price: originalItem?.price || 0,
          };
        })

      const { error: detailsError } = await supabase
        .from('dolce_order_details')
        .insert(orderDetails)

      if (detailsError) throw detailsError

      Toast.show({
        content: 'Order submitted successfully!',
        icon: 'success',
        position: 'top',
        duration: 2000,
      })

      // Reset Form
      customerNameRef.current?.clear?.()
      remarksRef.current?.clear?.()
      addressRef.current?.clear?.()
      phoneRef.current?.clear?.()

      setIsDelivery(false)

      const resetQuantities: Record<string, number> = {}
      menuItems.forEach(item => {
        resetQuantities[item.id] = 0
      })
      setQuantities(resetQuantities)

      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (err: any) {
      console.error('Error submitting order:', err)
      Toast.show({ icon: 'fail', content: 'Failed: ' + (err.message) })
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // --- RENDERING ---

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
        <ErrorBlock status='default' title='Unable to Load Menu' description={error} />
      </div>
    )
  }

  if (!menu) {
    return (
      <div style={{ padding: '20px' }}>
        <ErrorBlock status='empty' title='Menu not found' />
      </div>
    )
  }

  const menuDateStr = new Date(menu.menu_date).toLocaleDateString('ms-MY', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <AutoCenter>
        <h1 style={{ margin: '16px 0 8px', fontSize: '24px' }}>🍱 Vendor IOI - Est Dolce</h1>
        <p style={{ color: 'var(--adm-color-text-secondary)', margin: '0 0 8px' }}>{menuDateStr}</p>
      </AutoCenter>

      {!menu.is_closed && (
        <Button block color='success' onClick={() => router.push(`/dolce/summary/${menuId}`)} style={{ marginBottom: '24px' }}>
          View Order Summary
        </Button>
      )}

      {menu.is_closed ? (
        <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
          <Lock size={48} color='var(--adm-color-danger)' style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--adm-color-danger)' }}>Orders are already closed ⛔</h3>
          <Button block color='primary' onClick={() => router.push(`/dolce/summary/${menuId}`)} style={{ marginTop: '24px' }}>
            View Order Summary
          </Button>
        </Card>
      ) : (
        <Space direction='vertical' block style={{ '--gap': '24px' }}>

          {/* Customer Name */}
          <Card title='Nama Pelanggan'>
            <Input
              ref={customerNameRef}
              placeholder='Masukkan nama anda di sini'
              clearable
              style={{ '--font-size': '16px', border: '1px solid var(--adm-color-border)', borderRadius: '8px', padding: '8px' }}
            />
          </Card>

          {/* Menu Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShoppingCart size={20} color='var(--adm-color-primary)' />
              <span style={{ fontWeight: 'bold', fontSize: '17px' }}>Pilih Menu Makanan</span>
            </div>

            {groupedItems.map(([categoryName, items]) => (
              <Card
                key={categoryName}
                title={<div style={{ color: 'var(--adm-color-primary)', fontWeight: 600, fontSize: '15px' }}>{categoryName}</div>}
                style={{ marginBottom: '12px' }}
                bodyStyle={{ padding: '4px 8px 8px 8px' }}
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'flex-start',  // Changed from 'center' to allow wrapping
                      justifyContent: 'space-between',
                      gap: '8px',
                      minHeight: '36px'  // Ensure consistent minimum height
                    }}
                  >
                    {/* Item Name - Takes available space and wraps */}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333',
                      flex: 1,
                      minWidth: 0,
                      lineHeight: '1.4',  // Better line spacing for wrapped text
                      paddingTop: '2px'   // Align with controls
                    }}>
                      {item.item_name}
                    </span>

                    {/* Price - Fixed width */}
                    {item.price > 0 && (
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#52c41a',
                        flexShrink: 0,
                        minWidth: '60px',
                        textAlign: 'right',
                        paddingTop: '2px'  // Align with item name
                      }}>
                        RM {item.price.toFixed(2)}
                      </span>
                    )}

                    {/* Quantity Picker - Fixed width */}
                    <div style={{ flexShrink: 0 }}>
                      <QuantityPicker
                        itemName={item.item_name}
                        value={quantities[item.id] || 0}
                        onChange={(value: number) => handleQuantityChange(item.id, value)}
                      />
                    </div>
                  </div>
                ))}
              </Card>
            ))}
          </div>

          {/* Remarks */}
          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={20} color='var(--adm-color-primary)' /><span>Catatan / Remarks</span></div>}>
            <TextArea ref={remarksRef} placeholder='Nasi Separuh, Ayam Thigh, Kuah Kari Lebih' autoSize={{ minRows: 2, maxRows: 6 }} />
          </Card>

          {/* Delivery & Totals Section */}
          <Card
            style={{ border: '1px solid #dbeafe' }}
            title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} color='var(--adm-color-primary)' /><span>Delivery & Payment</span></div>}
          >
            <List>
              {/* Delivery Toggle */}
              <List.Item
                extra={
                  <Switch
                    checked={isDelivery}
                    onChange={handleDeliveryToggle}
                    style={{ '--checked-color': 'var(--adm-color-primary)' }}
                  />
                }
                description={isDelivery ? 'Delivery Fee: RM 3.00' : 'Self pick-up'}
              >
                Cash on Delivery (COD)
              </List.Item>
            </List>

            {/* Address Input (Conditional) */}
            {isDelivery && (
              <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                    <Phone size={16} />
                    <span>Nombor Telefon:</span>
                  </div>
                  <Input
                    ref={phoneRef}
                    placeholder="0123456789"
                    type='tel'
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '14px',
                      background: '#fffbe6'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                  <MapPin size={16} />
                  <span>Alamat Penghantaran:</span>
                </div>
                <TextArea
                  ref={addressRef}
                  placeholder="Sila masukkan alamat penghantaran anda.."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '14px',
                    background: '#fffbe6'
                  }}
                />
              </div>
            )}

            <div style={{ marginTop: '24px', borderTop: '1px dashed #ccc', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                <span>Subtotal Item:</span>
                <span>RM {itemTotal.toFixed(2)}</span>
              </div>
              {isDelivery && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                  <span>Delivery Charge:</span>
                  <span>RM {DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--adm-color-primary)' }}>
                <span>Total Amount:</span>
                <span>RM {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Button block color='primary' size='large' onClick={handleSubmit} loading={submitting} disabled={itemTotal === 0}>
            Submit Order (RM {grandTotal.toFixed(2)})
          </Button>
        </Space>
      )}
    </div>
  )
}