import Link from "next/link"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-primary/10 via-background to-accent/10 backdrop-blur-sm">
            <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Vehicle Tracker</span>
                </Link>
                <div className="ml-auto flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
