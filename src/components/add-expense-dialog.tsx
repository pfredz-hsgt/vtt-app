'use client'

import { useState } from 'react'
import {
    Popup,
    Form,
    Input,
    Button,
    Picker,
    DatePicker,
    TextArea,
    Toast,
    NavBar
} from 'antd-mobile'
import { DownOutline, CloseOutline } from 'antd-mobile-icons'
import { Plus } from 'lucide-react'
import { addExpense } from '@/app/(main)/actions'
import { ExpenseGroup } from '@/types'
import { getCategories } from '@/lib/expense-categories'
import dayjs from 'dayjs'

interface AddExpenseDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultGroup?: ExpenseGroup
}

export function AddExpenseDialog({ open: controlledOpen, onOpenChange, defaultGroup = 'vehicle' }: AddExpenseDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [form] = Form.useForm()

    // Internal state to sync with Form values
    const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>(defaultGroup)
    const [pickerVisible, setPickerVisible] = useState(false)
    const [typePickerVisible, setTypePickerVisible] = useState(false)

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const categories = getCategories(expenseGroup)
    const isVehicle = expenseGroup === 'vehicle'

    const handleFinish = async (values: any) => {
        const formData = new FormData()

        // Ensure values from Picker are extracted correctly (Picker returns array)
        const typeValue = Array.isArray(values.type) ? values.type[0] : values.type
        const expenseGroupValue = Array.isArray(values.expenseGroup) ? values.expenseGroup[0] : expenseGroup

        formData.append('expense_group', expenseGroupValue)
        formData.append('expense_date', values.date.toISOString())
        formData.append('type', typeValue)
        formData.append('cost', values.cost)

        if (values.odometer) formData.append('odometer', values.odometer)
        if (values.notes) formData.append('notes', values.notes)

        const result = await addExpense(formData)
        if (result?.error) {
            Toast.show({
                icon: 'fail',
                content: result.error,
            })
        } else {
            Toast.show({
                icon: 'success',
                content: 'Expense added!',
            })
            setOpen(false)
            form.resetFields()
        }
    }

    return (
        <>
            {!controlledOpen && (
                <Button
                    fill='outline'
                    size='small'
                    color='primary'
                    onClick={() => setOpen(true)}
                    style={{ border: 'none', padding: '0 8px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={16} />
                        <span>Add</span>
                    </div>
                </Button>
            )}

            <Popup
                visible={open}
                onMaskClick={() => setOpen(false)}
                position='bottom'
                bodyStyle={{ height: '100vh', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            >
                <div style={{ paddingBottom: '40px', height: '100%', overflowY: 'auto' }}>
                    <NavBar
                        right={<CloseOutline fontSize={24} onClick={() => setOpen(false)} />}
                        backArrow={false}
                    >
                        Add Expense
                    </NavBar>

                    <div style={{ padding: '0 12px' }}>
                        <Form
                            form={form}
                            onFinish={handleFinish}
                            layout='vertical'
                            footer={
                                <Button block type='submit' color='primary' size='large'>
                                    Save Expense
                                </Button>
                            }
                            initialValues={{
                                date: new Date(),
                                expenseGroup: [defaultGroup]
                            }}
                        >
                            <Form.Item
                                name='expenseGroup'
                                label='Expense Type'
                                trigger='onConfirm'
                                onClick={() => setTypePickerVisible(true)}
                                arrow={false}
                            >
                                <Picker
                                    confirmText="OK"
                                    cancelText="Cancel"
                                    columns={[
                                        [
                                            { label: 'Vehicle', value: 'vehicle' },
                                            { label: 'Personal', value: 'personal' },
                                        ]
                                    ]}
                                    visible={typePickerVisible}
                                    onClose={() => setTypePickerVisible(false)}
                                    onConfirm={(v) => {
                                        if (v[0]) setExpenseGroup(v[0] as ExpenseGroup)
                                    }}
                                >
                                    {items => (
                                        <div style={{
                                            padding: '8px 12px',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            minHeight: '24px'
                                        }}>
                                            <span>
                                                {items && items[0] && items[0].value
                                                    ? (items[0].value === 'vehicle' ? 'Vehicle' : 'Personal')
                                                    : 'Select Type'}
                                            </span>
                                            <DownOutline style={{ color: '#999' }} />
                                        </div>
                                    )}
                                </Picker>
                            </Form.Item>

                            <Form.Item
                                name='date'
                                label='Date'
                                trigger='onConfirm'
                                onClick={(e, datePickerRef: any) => {
                                    datePickerRef.current?.open()
                                }}
                                arrow={false}
                            >
                                <DatePicker
                                    confirmText="OK"
                                    cancelText="Cancel"
                                >
                                    {value => (
                                        <div style={{
                                            padding: '8px 12px',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            minHeight: '24px'
                                        }}>
                                            <span>{value ? dayjs(value).format('YYYY-MM-DD') : 'Select Date'}</span>
                                            <DownOutline style={{ color: '#999' }} />
                                        </div>
                                    )}
                                </DatePicker>
                            </Form.Item>

                            <Form.Item
                                name='type'
                                label='Category'
                                rules={[{ required: true, message: 'Please select a category' }]}
                                trigger='onConfirm'
                                onClick={() => setPickerVisible(true)}
                                arrow={false}
                            >
                                <Picker
                                    confirmText="OK"
                                    cancelText="Cancel"
                                    columns={[categories.map(cat => ({ label: cat.name, value: cat.name }))]}
                                    visible={pickerVisible}
                                    onClose={() => setPickerVisible(false)}
                                >
                                    {items => (
                                        <div style={{
                                            padding: '8px 12px',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            color: items && items[0] ? '#000' : '#999',
                                            minHeight: '24px'
                                        }}>
                                            <span>{items && items[0] && items[0].label ? items[0].label : 'Select Category'}</span>
                                            <DownOutline style={{ color: '#999' }} />
                                        </div>
                                    )}
                                </Picker>
                            </Form.Item>

                            {isVehicle && (
                                <Form.Item
                                    name='odometer'
                                    label='Odometer (km)'
                                    rules={[{ required: isVehicle, message: 'Odometer is required' }]}
                                >
                                    <Input placeholder='Enter odometer reading' type='number' />
                                </Form.Item>
                            )}

                            <Form.Item
                                name='cost'
                                label='Cost (RM)'
                                rules={[{ required: true, message: 'Cost is required' }]}
                            >
                                <Input placeholder='Enter amount' type='number' />
                            </Form.Item>

                            <Form.Item name='notes' label='Notes (Optional)'>
                                <TextArea placeholder='Add any notes here' autoSize={{ minRows: 2, maxRows: 4 }} />
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Popup>
        </>
    )
}
