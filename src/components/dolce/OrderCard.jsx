'use client'

import { Card, Tag, Button, Checkbox } from 'antd-mobile'
import { Trash2, MapPin, Truck } from 'lucide-react'

export default function OrderCard({ order, onDelete, onTogglePaid }) {
  // Safety check
  if (!order) return null;

  // Safe calculation
  const totalAmount = order?.total_amount
    ? parseFloat(order.total_amount).toFixed(2)
    : '0.00';

  return (
    <Card
      style={{
        borderLeft: order.is_paid ? '4px solid var(--adm-color-success)' : '4px solid var(--adm-color-warning)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{order.customer_name || 'Unknown'}</h3>
            {order.is_delivery && <Truck size={16} color="var(--adm-color-primary)" />}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {order.created_at
              ? new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : ''}
          </div>
        </div>

        {/* Price Tag */}
        <div style={{ textAlign: 'right' }}>
          <Tag color='primary' fill='outline' style={{ fontSize: '14px', fontWeight: 'bold' }}>
            RM {totalAmount}
          </Tag>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        {order.order_details && order.order_details.map((detail) => (
          <div key={detail.id || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '15px' }}>
            <span>{detail.item_name}</span>
            <span style={{ fontWeight: 500 }}>
              RM {detail.price ? parseFloat(detail.price).toFixed(2) : '0.00'} x{detail.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Address Section */}
      {order.is_delivery && order.delivery_address && (
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          background: '#f9f9f9',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#555',
          display: 'flex',
          gap: '6px'
        }}>
          <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{order.delivery_address}</span>
            {order.phone_number && (
              <span style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
                📞 {order.phone_number}
              </span>
            )}
          </div>
        </div>
      )}

      {order.remarks && (
        <div style={{ marginBottom: '16px', padding: '8px', background: '#fff7ed', borderRadius: '4px', fontSize: '14px', color: '#c2410c' }}>
          📝 {order.remarks}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #eee' }}>
        <Checkbox
          checked={order.is_paid || false}
          onChange={(checked) => onTogglePaid(order.id, checked)}
          style={{ '--font-size': '14px' }}
        >
          {order.is_paid ? 'Paid' : 'Mark as Paid'}
        </Checkbox>

        <Button
          color='danger'
          fill='none'
          size='small'
          onClick={() => onDelete(order.id)}
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </Card>
  )
}