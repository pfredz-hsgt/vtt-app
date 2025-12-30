'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
    Button,
    Popup,
    Form,
    Input,
    Picker,
    DatePicker,
    TextArea,
    NavBar,
    Toast
} from 'antd-mobile'
import { DownOutline, CloseOutline } from 'antd-mobile-icons'
import { ExpenseGroup, RecurringFrequency } from '@/types'
import { getCategories } from '@/lib/expense-categories'
import { addRecurringExpense } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

export function AddRecurringExpenseDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [form] = Form.useForm()

    // Internal state to sync with Form values/Pickers
    const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>('personal')
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')

    // Visibility states for pickers
    const [groupPickerVisible, setGroupPickerVisible] = useState(false)
    const [categoryPickerVisible, setCategoryPickerVisible] = useState(false)
    const [freqPickerVisible, setFreqPickerVisible] = useState(false)
    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false)
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false)

    const categories = getCategories(expenseGroup)

    async function handleFinish(values: any) {
        const formData = new FormData()

        // Extract values (handling array return from Pickers)
        const typeValue = Array.isArray(values.type) ? values.type[0] : values.type
        const groupValue = Array.isArray(values.expenseGroup) ? values.expenseGroup[0] : expenseGroup
        const freqValue = Array.isArray(values.frequency) ? values.frequency[0] : frequency

        formData.append('name', values.name)
        formData.append('expense_group', groupValue)
        formData.append('type', typeValue)
        formData.append('amount', values.amount)
        formData.append('frequency', freqValue)
        formData.append('start_date', values.start_date.toISOString())

        if (values.end_date) formData.append('end_date', values.end_date.toISOString())
        if (values.day_of_month) formData.append('day_of_month', values.day_of_month)
        if (values.notes) formData.append('notes', values.notes)

        const result = await addRecurringExpense(formData)
        if (result?.error) {
            Toast.show({
                icon: 'fail',
                content: result.error,
            })
        } else {
            Toast.show({
                icon: 'success',
                content: 'Recurring expense added!',
            })
            setOpen(false)
            form.resetFields()
            router.refresh()
        }
    }

    const frequencyOptions = [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Yearly', value: 'yearly' },
    ]

    const groupOptions = [
        { label: 'Personal', value: 'personal' },
        { label: 'Vehicle', value: 'vehicle' },
    ]

    return (
        <>
            <Button
                color='primary'
                fill='solid'
                size='small'
                onClick={() => setOpen(true)}
                style={{ padding: '0 12px', borderRadius: '20px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={16} />
                    <span>Add</span>
                </div>
            </Button>

            <Popup
                visible={open}
                onMaskClick={() => setOpen(false)}
                position='bottom'
                bodyStyle={{ height: '90vh', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
            >
                <div style={{ paddingBottom: '40px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <NavBar
                        right={<CloseOutline fontSize={24} onClick={() => setOpen(false)} />}
                        backArrow={false}
                        style={{ flexShrink: 0 }}
                    >
                        Add Recurring Expense
                    </NavBar>

                    <div style={{ padding: '0 12px', flex: 1 }}>
                        <Form
                            form={form}
                            layout='vertical'
                            onFinish={handleFinish}
                            initialValues={{
                                expenseGroup: ['personal'],
                                frequency: ['monthly'],
                                start_date: new Date()
                            }}
                            footer={
                                <Button block type='submit' color='primary' size='large'>
                                    Create Recurring Expense
                                </Button>
                            }
                        >
                            <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Name is required' }]}>
                                <Input placeholder='e.g., Car Loan, Netflix' />
                            </Form.Item>

                            <Form.Item
                                name='expenseGroup'
                                label='Group'
                                trigger='onConfirm'
                                onClick={() => setGroupPickerVisible(true)}
                            >
                                <Picker
                                    columns={[groupOptions]}
                                    visible={groupPickerVisible}
                                    onClose={() => setGroupPickerVisible(false)}
                                    onConfirm={v => {
                                        if (v[0]) setExpenseGroup(v[0] as ExpenseGroup)
                                    }}
                                >
                                    {items => (
                                        <div className='form-picker-trigger'>
                                            <span>{items[0]?.label || 'Select Group'}</span>
                                            <DownOutline />
                                        </div>
                                    )}
                                </Picker>
                            </Form.Item>

                            <Form.Item
                                name='type'
                                label='Category'
                                rules={[{ required: true, message: 'Category is required' }]}
                                trigger='onConfirm'
                                onClick={() => setCategoryPickerVisible(true)}
                            >
                                <Picker
                                    columns={[categories.map(c => ({ label: c.name, value: c.name }))]}
                                    visible={categoryPickerVisible}
                                    onClose={() => setCategoryPickerVisible(false)}
                                >
                                    {items => (
                                        <div className='form-picker-trigger'>
                                            <span>{items[0]?.label || 'Select Category'}</span>
                                            <DownOutline />
                                        </div>
                                    )}
                                </Picker>
                            </Form.Item>

                            <Form.Item name='amount' label='Amount (RM)' rules={[{ required: true, message: 'Amount is required' }]}>
                                <Input type='number' placeholder='0.00' />
                            </Form.Item>

                            <Form.Item
                                name='frequency'
                                label='Frequency'
                                trigger='onConfirm'
                                onClick={() => setFreqPickerVisible(true)}
                            >
                                <Picker
                                    columns={[frequencyOptions]}
                                    visible={freqPickerVisible}
                                    onClose={() => setFreqPickerVisible(false)}
                                    onConfirm={v => {
                                        if (v[0]) setFrequency(v[0] as RecurringFrequency)
                                    }}
                                >
                                    {items => (
                                        <div className='form-picker-trigger'>
                                            <span>{items[0]?.label || 'Select Frequency'}</span>
                                            <DownOutline />
                                        </div>
                                    )}
                                </Picker>
                            </Form.Item>

                            {frequency === 'monthly' && (
                                <Form.Item
                                    name='day_of_month'
                                    label='Day of Month'
                                    rules={[{ required: true }]}
                                >
                                    <Input type='number' min={1} max={28} placeholder='1-28' />
                                </Form.Item>
                            )}

                            <Form.Item
                                name='start_date'
                                label='Start Date'
                                trigger='onConfirm'
                                onClick={() => setStartDatePickerVisible(true)}
                            >
                                <DatePicker
                                    visible={startDatePickerVisible}
                                    onClose={() => setStartDatePickerVisible(false)}
                                >
                                    {value => (
                                        <div className='form-picker-trigger'>
                                            <span>{value ? dayjs(value).format('YYYY-MM-DD') : 'Select Date'}</span>
                                            <DownOutline />
                                        </div>
                                    )}
                                </DatePicker>
                            </Form.Item>

                            <Form.Item
                                name='end_date'
                                label='End Date (Optional)'
                                trigger='onConfirm'
                                onClick={() => setEndDatePickerVisible(true)}
                            >
                                <DatePicker
                                    visible={endDatePickerVisible}
                                    onClose={() => setEndDatePickerVisible(false)}
                                >
                                    {value => (
                                        <div className='form-picker-trigger'>
                                            <span>{value ? dayjs(value).format('YYYY-MM-DD') : 'Select Date'}</span>
                                            <DownOutline />
                                        </div>
                                    )}
                                </DatePicker>
                            </Form.Item>

                            <Form.Item name='notes' label='Notes'>
                                <TextArea placeholder='Optional notes' autoSize={{ minRows: 2, maxRows: 4 }} />
                            </Form.Item>

                            <style jsx global>{`
                                .form-picker-trigger {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 4px 0;
                                    min-height: 24px;
                                    width: 100%;
                                    color: #333;
                                }
                            `}</style>
                        </Form>
                    </div>
                </div>
            </Popup>
        </>
    )
}
