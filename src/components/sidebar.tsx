'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Car,
    Wallet,
    Calendar,
    BarChart3,
    ChevronLeft,
    X
} from 'lucide-react'
import { useSidebar } from './sidebar-provider'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Vehicle', href: '/vehicle', icon: Car },
    { name: 'Personal', href: '/personal', icon: Wallet },
    { name: 'Recurring', href: '/recurring', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()
    const { isOpen, isMobile, close } = useSidebar()

    if (!isOpen) return null

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={close}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-14 sm:top-16 bottom-0 left-0 z-50 bg-background border-r transition-transform duration-300',
                    'w-64',
                    isMobile && 'shadow-lg',
                    !isMobile && 'md:translate-x-0'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile close button */}
                    {isMobile && (
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold">Menu</h2>
                            <button
                                onClick={close}
                                className="p-2 hover:bg-accent rounded-md transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => isMobile && close()}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium">Expense Tracker</p>
                            <p className="mt-1">Track all your expenses</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
