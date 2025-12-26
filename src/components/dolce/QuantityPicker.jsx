'use client'

import { Stepper } from 'antd-mobile'

export default function QuantityPicker({ value = 0, onChange, itemName }) {
    return (
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
    )
}
