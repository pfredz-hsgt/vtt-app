import {
    ExpenseCategory,
    VehicleCategory,
    PersonalCategory,
    ExpenseGroup,
    CategoryInfo,
} from '@/types'

// Vehicle categories with icons and colors
export const VEHICLE_CATEGORIES: CategoryInfo[] = [
    { name: 'Fuel', icon: 'Fuel', color: 'hsl(25, 95%, 53%)', group: 'vehicle' },
    { name: 'Maintenance', icon: 'Wrench', color: 'hsl(217, 91%, 60%)', group: 'vehicle' },
    { name: 'Insurance', icon: 'Shield', color: 'hsl(142, 71%, 45%)', group: 'vehicle' },
    { name: 'Repairs', icon: 'Settings', color: 'hsl(0, 84%, 60%)', group: 'vehicle' },
    { name: 'Parking', icon: 'ParkingCircle', color: 'hsl(262, 83%, 58%)', group: 'vehicle' },
    { name: 'Tolls', icon: 'Coins', color: 'hsl(48, 96%, 53%)', group: 'vehicle' },
    { name: 'Cleaning', icon: 'Sparkles', color: 'hsl(199, 89%, 48%)', group: 'vehicle' },
    { name: 'Parts', icon: 'Package', color: 'hsl(24, 70%, 50%)', group: 'vehicle' },
    { name: 'Accessories', icon: 'ShoppingBag', color: 'hsl(280, 67%, 55%)', group: 'vehicle' },
    { name: 'Vehicle Other', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 65%)', group: 'vehicle' },
]

// Personal categories with icons and colors
export const PERSONAL_CATEGORIES: CategoryInfo[] = [
    { name: 'Food & Dining', icon: 'Utensils', color: 'hsl(15, 86%, 58%)', group: 'personal' },
    { name: 'Groceries', icon: 'ShoppingCart', color: 'hsl(142, 76%, 36%)', group: 'personal' },
    { name: 'Shopping', icon: 'ShoppingBag', color: 'hsl(280, 67%, 55%)', group: 'personal' },
    { name: 'Entertainment', icon: 'Film', color: 'hsl(262, 83%, 58%)', group: 'personal' },
    { name: 'Leisure', icon: 'Palmtree', color: 'hsl(173, 58%, 39%)', group: 'personal' },
    { name: 'Health & Fitness', icon: 'Heart', color: 'hsl(0, 84%, 60%)', group: 'personal' },
    { name: 'Transportation', icon: 'Bus', color: 'hsl(217, 91%, 60%)', group: 'personal' },
    { name: 'Utilities', icon: 'Zap', color: 'hsl(48, 96%, 53%)', group: 'personal' },
    { name: 'Subscriptions', icon: 'CreditCard', color: 'hsl(199, 89%, 48%)', group: 'personal' },
    { name: 'Education', icon: 'GraduationCap', color: 'hsl(217, 91%, 60%)', group: 'personal' },
    { name: 'Gifts', icon: 'Gift', color: 'hsl(340, 82%, 52%)', group: 'personal' },
    { name: 'Personal Care', icon: 'Sparkles', color: 'hsl(280, 67%, 55%)', group: 'personal' },
    { name: 'Personal Other', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 65%)', group: 'personal' },
]

// Legacy category mapping (for backward compatibility)
export const LEGACY_CATEGORY_MAP: Record<string, VehicleCategory> = {
    'Refuel': 'Fuel',
    'Service': 'Maintenance',
    'Wash': 'Cleaning',
    'Repair': 'Repairs',
    'Other': 'Vehicle Other',
}

/**
 * Get all categories for a specific expense group
 */
export function getCategories(group: ExpenseGroup): CategoryInfo[] {
    return group === 'vehicle' ? VEHICLE_CATEGORIES : PERSONAL_CATEGORIES
}

/**
 * Get category info by name
 */
export function getCategoryInfo(categoryName: ExpenseCategory): CategoryInfo | undefined {
    const allCategories = [...VEHICLE_CATEGORIES, ...PERSONAL_CATEGORIES]
    return allCategories.find(cat => cat.name === categoryName)
}

/**
 * Get category icon name
 */
export function getCategoryIcon(categoryName: ExpenseCategory): string {
    const info = getCategoryInfo(categoryName)
    return info?.icon || 'Circle'
}

/**
 * Get category color
 */
export function getCategoryColor(categoryName: ExpenseCategory): string {
    const info = getCategoryInfo(categoryName)
    return info?.color || 'hsl(215, 20%, 65%)'
}

/**
 * Get expense group for a category
 */
export function getExpenseGroup(categoryName: ExpenseCategory): ExpenseGroup {
    const info = getCategoryInfo(categoryName)
    return info?.group || 'personal'
}

/**
 * Check if category is a vehicle category
 */
export function isVehicleCategory(categoryName: ExpenseCategory): boolean {
    return VEHICLE_CATEGORIES.some(cat => cat.name === categoryName)
}

/**
 * Check if category is a personal category
 */
export function isPersonalCategory(categoryName: ExpenseCategory): boolean {
    return PERSONAL_CATEGORIES.some(cat => cat.name === categoryName)
}

/**
 * Normalize legacy category names to new ones
 */
export function normalizeCategoryName(categoryName: string): ExpenseCategory {
    if (categoryName in LEGACY_CATEGORY_MAP) {
        return LEGACY_CATEGORY_MAP[categoryName as keyof typeof LEGACY_CATEGORY_MAP]
    }
    return categoryName as ExpenseCategory
}
