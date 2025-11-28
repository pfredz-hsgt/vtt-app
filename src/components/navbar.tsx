'use client'

import Link from "next/link"
import { Car } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Navbar() {
    const [vehicleInfo, setVehicleInfo] = useState("My Vehicle - ABC1234")

    return (
        <nav className="sticky top-0 z-50 border-b bg-background">
            <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6 gap-4">
                <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base hidden sm:inline">Vehicle Tracker</span>
                </Link>
                <Input
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    placeholder="Vehicle name - Plate number"
                    className="ml-auto max-w-xs text-sm border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                />
            </div>
        </nav>
    )
}
