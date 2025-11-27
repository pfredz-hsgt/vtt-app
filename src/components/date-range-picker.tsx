"use client"

import * as React from "react"
import { addDays, format, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
    className,
    dateRange,
    setDateRange,
}: {
    className?: string
    dateRange: DateRange | undefined
    setDateRange: (range: DateRange | undefined) => void
}) {
    const presets = [
        {
            label: "This Month",
            range: {
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
            },
        },
        {
            label: "Last Month",
            range: {
                from: startOfMonth(subMonths(new Date(), 1)),
                to: endOfMonth(subMonths(new Date(), 1)),
            },
        },
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <div className="border-r p-3">
                            <div className="space-y-2">
                                {presets.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => setDateRange(preset.range)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => setDateRange(undefined)}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
