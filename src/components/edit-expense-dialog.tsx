'use client'

import { useState, useEffect } from 'react'
import {
    Popup,
    Form,
    Input,
    Button,
    Picker,
    DatePicker,
    TextArea,
    Toast,
    Dialog,
    NavBar
} from 'antd-mobile'
import { DownOutline, CloseOutline } from 'antd-mobile-icons'
import { Trash2 } from 'lucide-react'
import { updateExpense, deleteExpense } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'
import { getCategories, getExpenseGroup } from '@/lib/expense-categories'
import dayjs from 'dayjs'

interface EditExpenseDialogProps {
    expense: {
        id: string
        type: string
        expense_group?: string
        odometer?: number | null
        cost: number
        notes?: string | null
        created_at: string
    } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditExpenseDialog({ expense, open, onOpenChange }: EditExpenseDialogProps) {
    const router = useRouter()
    const [form] = Form.useForm()
    const [pickerVisible, setPickerVisible] = useState(false)

    useEffect(() => {
        if (expense && open) {
            form.setFieldsValue({
                date: new Date(expense.created_at),
                type: [expense.type], // Picker expects array
                odometer: expense.odometer,
                cost: expense.cost.toString(),
                notes: expense.notes
            })
        }
    }, [expense, open, form])

    const handleFinish = async (values: any) => {
        if (!expense) return

        const formData = new FormData()
        // Extract single value from array for Picker
        const typeValue = Array.isArray(values.type) ? values.type[0] : values.type

        formData.append('expense_date', values.date.toISOString())
        formData.append('type', typeValue)
        formData.append('cost', values.cost)

        if (values.odometer) formData.append('odometer', values.odometer)
        if (values.notes) formData.append('notes', values.notes)

        const result = await updateExpense(expense.id, formData)
        if (result?.error) {
            Toast.show({ icon: 'fail', content: result.error })
        } else {
            Toast.show({ icon: 'success', content: 'Saved!' })
            onOpenChange(false)
            router.refresh()
        }
    }

    const handleDelete = async () => {
        if (!expense) return

        const result = await Dialog.confirm({
            content: 'Are you sure you want to delete this expense?',
        })

        if (result) {
            const res = await deleteExpense(expense.id)
            if (res?.error) {
                Toast.show({ icon: 'fail', content: res.error })
            } else {
                Toast.show({ icon: 'success', content: 'Deleted' })
                onOpenChange(false)
                router.refresh()
            }
        }
    }

    if (!expense) return null

    const expenseGroup = expense.expense_group || getExpenseGroup(expense.type as any)
    const categories = getCategories(expenseGroup as 'vehicle' | 'personal')
    const isVehicle = expenseGroup === 'vehicle'

    return (
        <Popup
            visible={open}
            onMaskClick={() => onOpenChange(false)}
            position='bottom'
            bodyStyle={{ height: '100vh', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        >
            <div style={{ paddingBottom: '40px', height: '100%', overflowY: 'auto' }}>
                <NavBar
                    right={
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Trash2 size={20} color='var(--adm-color-danger)' onClick={handleDelete} />
                            <CloseOutline fontSize={24} onClick={() => onOpenChange(false)} />
                        </div>
                    }
                    backArrow={false}
                >
                    Edit Expense
                </NavBar>

                <div style={{ padding: '0 12px' }}>
                    <Form
                        form={form}
                        onFinish={handleFinish}
                        layout='vertical'
                        footer={
                            <Button block type='submit' color='primary' size='large'>
                                Save Changes
                            </Button>
                        }
                    >
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
    )
}
