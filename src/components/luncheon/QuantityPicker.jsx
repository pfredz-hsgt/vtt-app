'use client'

import { Stepper } from 'antd-mobile'

export default function QuantityPicker({ value = 0, onChange, itemName }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#fff',
            borderBottom: '1px solid #f5f5f5'
        }}>
            <span style={{ fontSize: '16px', fontWeight: 500 }}>{itemName}</span>
            <Stepper
                value={value}
                onChange={onChange}
                min={0}
                style={{
                    '--button-background-color': 'var(--adm-color-light)',
                    '--input-width': '40px',
                    '--input-background-color': 'transparent'
                }}
            />
        </div>
    )
}
