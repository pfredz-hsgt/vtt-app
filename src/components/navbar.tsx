import Link from "next/link"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="border-b bg-background">
            <div className="container flex h-16 items-center px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Car className="h-6 w-6" />
                    <span>Vehicle Tracker</span>
                </Link>
                <div className="ml-auto flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
