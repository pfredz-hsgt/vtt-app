'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    isOpen: boolean
    isMobile: boolean
    toggle: () => void
    open: () => void
    close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check if mobile on mount
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            // Auto-close on mobile, auto-open on desktop
            if (window.innerWidth >= 768) {
                const saved = localStorage.getItem('sidebar-open')
                setIsOpen(saved !== 'false')
            } else {
                setIsOpen(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggle = () => {
        setIsOpen(prev => {
            const newValue = !prev
            if (!isMobile) {
                localStorage.setItem('sidebar-open', String(newValue))
            }
            return newValue
        })
    }

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return (
        <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
