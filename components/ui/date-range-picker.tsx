"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Calendar,
} from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange?: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fechas',
  className
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<{ from?: Date; to?: Date }>(value || {});

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      const newRange = { from: undefined, to: undefined };
      setDate(newRange);
      onChange?.(newRange);
      return;
    }

    if (!date.from || (date.from && date.to)) {
      // Start new range
      const newRange = { from: selectedDate, to: undefined };
      setDate(newRange);
      onChange?.(newRange);
    } else if (date.from && !date.to) {
      // Complete the range
      const newRange = selectedDate < date.from 
        ? { from: selectedDate, to: date.from }
        : { from: date.from, to: selectedDate };
      setDate(newRange);
      onChange?.(newRange);
    }
  };

  const formatDateRange = () => {
    if (date.from) {
      if (date.to) {
        return `${format(date.from, 'dd/MM/yyyy', { locale: es })} - ${format(date.to, 'dd/MM/yyyy', { locale: es })}`;
      }
      return format(date.from, 'dd/MM/yyyy', { locale: es });
    }
    return placeholder;
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date.from}
            onSelect={handleSelect}
            initialFocus
          />
          {date.from && !date.to && (
            <div className="p-3 border-t">
              <p className="text-sm text-muted-foreground">
                Selecciona la fecha final del rango
              </p>
            </div>
          )}
          {date.from && date.to && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRange = { from: undefined, to: undefined };
                  setDate(newRange);
                  onChange?.(newRange);
                }}
                className="w-full"
              >
                Limpiar selección
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
} 