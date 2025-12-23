// Type definitions for the expense tracker application

export type ExpenseGroup = 'vehicle' | 'personal'

export type VehicleCategory =
    | 'Fuel'
    | 'Maintenance'
    | 'Insurance'
    | 'Repairs'
    | 'Parking'
    | 'Tolls'
    | 'Cleaning'
    | 'Parts'
    | 'Accessories'
    | 'Vehicle Other'
    // Legacy categories
    | 'Refuel'
    | 'Service'
    | 'Wash'
    | 'Repair'
    | 'Other'

export type PersonalCategory =
    | 'Food & Dining'
    | 'Groceries'
    | 'Shopping'
    | 'Entertainment'
    | 'Leisure'
    | 'Health & Fitness'
    | 'Transportation'
    | 'Utilities'
    | 'Subscriptions'
    | 'Education'
    | 'Gifts'
    | 'Personal Care'
    | 'Personal Other'

export type ExpenseCategory = VehicleCategory | PersonalCategory

export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly'

export interface Expense {
    id: string
    created_at: string
    user_id: string
    expense_group: ExpenseGroup
    type: ExpenseCategory
    odometer?: number | null
    cost: number
    notes?: string | null
}

export interface RecurringExpense {
    id: string
    created_at: string
    updated_at: string
    user_id: string
    name: string
    amount: number
    expense_group: ExpenseGroup
    type: ExpenseCategory
    frequency: RecurringFrequency
    day_of_month?: number | null
    day_of_week?: number | null
    start_date: string
    end_date?: string | null
    last_generated_date?: string | null
    next_occurrence_date?: string | null
    odometer?: number | null
    notes?: string | null
    is_active: boolean
}

export interface CategoryInfo {
    name: ExpenseCategory
    icon: string
    color: string
    group: ExpenseGroup
}

export interface ChartDataPoint {
    label: string
    value: number
    color?: string
}

export interface TrendData {
    date: string
    amount: number
}

export interface CategoryBreakdown {
    category: ExpenseCategory
    total: number
    count: number
    percentage: number
    color: string
}

export interface ExpenseStats {
    total: number
    count: number
    average: number
    highest: number
    lowest: number
}

export interface DashboardData {
    grandTotal: number
    vehicleTotal: number
    personalTotal: number
    monthlyAverage: number
    topCategory: string
    recentExpenses: Expense[]
    categoryBreakdown: CategoryBreakdown[]
    monthlyTrend: TrendData[]
}

export interface AnalyticsData {
    totalExpenses: number
    vehicleExpenses: number
    personalExpenses: number
    averageExpense: number
    categoryBreakdown: CategoryBreakdown[]
    monthlyTrend: TrendData[]
    topCategories: CategoryBreakdown[]
}

export type TimePeriod = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all_time' | 'custom'
