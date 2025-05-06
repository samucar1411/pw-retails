"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CalendarProps,
} from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDate?: DateRange;
  onDateChange?: (dateRange: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({
  className,
  initialDate,
  onDateChange,
}: CalendarDateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialDate)
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    if (onDateChange) {
      onDateChange(selectedDate)
    }
    // Optionally close the popover after selection, or keep it open
    // if (selectedDate?.from && selectedDate?.to) {
    //   setIsOpen(false);
    // }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>Seleccionar rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es} // Use Spanish locale
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 