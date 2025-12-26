'use client'

import { Trash2 } from 'lucide-react'
import { Card, Checkbox, Button } from 'antd-mobile'

export default function OrderCard({ order, onDelete, onTogglePaid }) {
    return (
        <Card style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{order.customer_name}</h3>

                <Button
                    size='mini'
                    fill='none'
                    onClick={() => onDelete(order.id)}
                    style={{ padding: '4px' }}
                >
                    <Trash2 size={18} color='var(--adm-color-danger)' />
                </Button>
            </div>

            <div style={{ marginBottom: '12px' }}>
                {order.order_details && order.order_details.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.order_details.map((detail, index) => (
                            detail.quantity > 0 && (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: 'var(--adm-color-primary)',
                                        marginRight: '8px'
                                    }}></span>
                                    <span>{detail.item_name} <span style={{ color: 'var(--adm-color-text-secondary)' }}>× {detail.quantity}</span></span>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--adm-color-text-secondary)', fontStyle: 'italic', margin: 0 }}>No items</p>
                )}
            </div>

            {order.remarks && (
                <div style={{
                    background: 'var(--adm-color-background)',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: 'var(--adm-color-text-secondary)'
                }}>
                    <span style={{ fontWeight: 500 }}>💬 Remarks:</span> {order.remarks}
                </div>
            )}

            <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <Checkbox
                    checked={order.is_paid}
                    onChange={(checked) => onTogglePaid(order.id, checked)}
                    style={{
                        '--icon-size': '18px',
                        '--font-size': '14px',
                        '--gap': '8px'
                    }}
                >
                    <span style={{
                        fontWeight: 500,
                        color: order.is_paid ? 'var(--adm-color-success)' : 'var(--adm-color-text-secondary)'
                    }}>
                        {order.is_paid ? 'Paid' : 'Mark as paid'}
                    </span>
                </Checkbox>
            </div>
        </Card>
    )
}
