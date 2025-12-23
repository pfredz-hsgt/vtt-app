'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useSidebar } from "./sidebar-provider"
import { Button } from "./ui/button"

export function Navbar() {
    const pathname = usePathname()
    const { toggle } = useSidebar()
    const [vehicleInfo, setVehicleInfo] = useState("Proton Persona - VJ5332")

    // Show vehicle info only on vehicle page
    const showVehicleInfo = pathname === '/vehicle'

    return (
        <nav className="sticky top-0 z-50 border-b bg-background">
            <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6 gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className="shrink-0"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base hidden sm:inline">Expense Tracker</span>
                </Link>

                {showVehicleInfo && (
                    <div className="ml-auto max-w-xs text-sm px-3 py-2 rounded-md bg-muted">
                        {vehicleInfo || "Proton Persona - VJ5332"}
                    </div>
                )}
            </div>
        </nav>
    )
}
