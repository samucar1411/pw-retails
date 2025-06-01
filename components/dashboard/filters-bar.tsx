"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar, Filter, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { getAllOfficesComplete } from "@/services/office-service";
import { Office } from "@/types/office";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  fromDate: string;
  toDate: string;
  officeId: string; // This will be office ID, not code
  onFiltersChange: (newFrom: string, newTo: string, newOfficeId: string) => void;
}

// Extract the filter form into a separate component
function FilterForm({
  localFromDate,
  setLocalFromDate,
  localToDate,
  setLocalToDate,
  localOfficeId,
  open,
  setOpen,
  offices,
  isLoadingOffices,
  selectedOffice,
  isDateRangeValid,
  handleApplyFilters,
  handleReset,
  handleOfficeSelect,
  onClose,
}: {
  localFromDate: string;
  setLocalFromDate: (date: string) => void;
  localToDate: string;
  setLocalToDate: (date: string) => void;
  localOfficeId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  offices: Office[];
  isLoadingOffices: boolean;
  selectedOffice: string;
  isDateRangeValid: boolean;
  handleApplyFilters: () => void;
  handleReset: () => void;
  handleOfficeSelect: (officeId: string) => void;
  onClose?: () => void;
}) {
  const handleApplyAndClose = () => {
    handleApplyFilters();
    onClose?.();
  };

  const handleResetAndClose = () => {
    handleReset();
    onClose?.();
  };

  return (
    <div className="space-y-4">
      {/* From Date */}
      <div className="space-y-2">
        <Label htmlFor="from-date" className="text-sm font-medium">
          Fecha inicial
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            id="from-date"
            type="date"
            value={localFromDate}
            onChange={(e) => setLocalFromDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
      </div>

      {/* To Date */}
      <div className="space-y-2">
        <Label htmlFor="to-date" className="text-sm font-medium">
          Fecha final
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            id="to-date"
            type="date"
            value={localToDate}
            onChange={(e) => setLocalToDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
      </div>

      {/* Office Command Select */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Sucursal
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoadingOffices}
            >
              <span className="truncate">
                {isLoadingOffices ? "Cargando..." : selectedOffice}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput
                placeholder="Buscar sucursal..."
              />
              <CommandList>
                <CommandEmpty>No se encontraron sucursales</CommandEmpty>
                <CommandItem
                  key="all"
                  value="all"
                  onSelect={() => handleOfficeSelect("all")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      localOfficeId === "all" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Todas las sucursales
                </CommandItem>
                {offices.map((office: Office) => (
                  <CommandItem
                    key={office.id}
                    value={`${office.Name} ${office.Code}`}
                    onSelect={() => handleOfficeSelect(office.id.toString())}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        localOfficeId === office.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {office.Name} ({office.Code})
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 pt-4">
        <Button
          onClick={handleApplyAndClose}
          disabled={!isDateRangeValid}
          className="w-full"
        >
          {!isDateRangeValid && localFromDate && localToDate ? (
            <span className="text-xs">Fechas inválidas</span>
          ) : (
            "Aplicar filtros"
          )}
        </Button>
        <Button
          onClick={handleResetAndClose}
          variant="outline"
          className="w-full"
        >
          Restablecer
        </Button>
      </div>

      {/* Validation Message */}
      {!isDateRangeValid && localFromDate && localToDate && (
        <div className="mt-3 text-sm text-destructive">
          La fecha final debe ser igual o posterior a la fecha inicial
        </div>
      )}

      {/* Loading indicator for offices */}
      {isLoadingOffices && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando sucursales...
        </div>
      )}
    </div>
  );
}

export function FiltersBar({
  fromDate,
  toDate,
  officeId,
  onFiltersChange,
}: FiltersBarProps) {
  const [localFromDate, setLocalFromDate] = React.useState(fromDate);
  const [localToDate, setLocalToDate] = React.useState(toDate);
  const [localOfficeId, setLocalOfficeId] = React.useState(officeId === "" ? "all" : officeId);
  const [open, setOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Fetch all offices using the new endpoint
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery({
    queryKey: ['all-offices-complete'],
    queryFn: getAllOfficesComplete,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update local state when props change
  React.useEffect(() => {
    setLocalFromDate(fromDate);
    setLocalToDate(toDate);
    // Convert empty string to "all" for local state
    setLocalOfficeId(officeId === "" ? "all" : officeId);
  }, [fromDate, toDate, officeId]);

  // Get selected office display name
  const selectedOffice = React.useMemo(() => {
    if (localOfficeId === "all") return "Todas las sucursales";
    // Find office by ID instead of code
    const office = offices.find((o: Office) => o.id.toString() === localOfficeId);
    return office ? `${office.Name} (${office.Code})` : "Sucursal no encontrada";
  }, [localOfficeId, offices]);

  // Validate dates
  const isDateRangeValid = React.useMemo(() => {
    // If both dates are empty, it's valid (no filter)
    if (!localFromDate && !localToDate) return true;
    // If only one date is provided, it's still valid
    if (!localFromDate || !localToDate) return true;
    // If both dates are provided, validate the range
    return new Date(localFromDate) <= new Date(localToDate);
  }, [localFromDate, localToDate]);

  const handleApplyFilters = () => {
    if (isDateRangeValid) {
      // Convert "all" to empty string for the parent component
      const officeValue = localOfficeId === "all" ? "" : localOfficeId;
      onFiltersChange(localFromDate, localToDate, officeValue);
    }
  };

  const handleReset = () => {
    setLocalFromDate("");
    setLocalToDate("");
    setLocalOfficeId("all");
    onFiltersChange("", "", "");
  };

  const handleOfficeSelect = (officeId: string) => {
    setLocalOfficeId(officeId);
    setOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return localFromDate !== "" || localToDate !== "" || localOfficeId !== "all";
  }, [localFromDate, localToDate, localOfficeId]);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="block md:hidden mb-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros del Dashboard
              </SheetTitle>
            </SheetHeader>
            <div className="px-6 flex-1">
              <FilterForm
                localFromDate={localFromDate}
                setLocalFromDate={setLocalFromDate}
                localToDate={localToDate}
                setLocalToDate={setLocalToDate}
                localOfficeId={localOfficeId}
                open={open}
                setOpen={setOpen}
                offices={offices}
                isLoadingOffices={isLoadingOffices}
                selectedOffice={selectedOffice}
                isDateRangeValid={isDateRangeValid}
                handleApplyFilters={handleApplyFilters}
                handleReset={handleReset}
                handleOfficeSelect={handleOfficeSelect}
                onClose={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Card */}
      <Card className="hidden md:block mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros del Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* From Date */}
            <div className="space-y-2">
              <Label htmlFor="from-date-desktop" className="text-sm font-medium">
                Fecha inicial
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="from-date-desktop"
                  type="date"
                  value={localFromDate}
                  onChange={(e) => setLocalFromDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label htmlFor="to-date-desktop" className="text-sm font-medium">
                Fecha final
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="to-date-desktop"
                  type="date"
                  value={localToDate}
                  onChange={(e) => setLocalToDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            {/* Office Command Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Sucursal
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={isLoadingOffices}
                  >
                    <span className="truncate">
                      {isLoadingOffices ? "Cargando..." : selectedOffice}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar sucursal..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron sucursales</CommandEmpty>
                      <CommandItem
                        key="all"
                        value="all"
                        onSelect={() => handleOfficeSelect("all")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            localOfficeId === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas las sucursales
                      </CommandItem>
                      {offices.map((office: Office) => (
                        <CommandItem
                          key={office.id}
                          value={`${office.Name} ${office.Code}`}
                          onSelect={() => handleOfficeSelect(office.id.toString())}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              localOfficeId === office.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {office.Name} ({office.Code})
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFilters}
                disabled={!isDateRangeValid}
                className="flex-1"
              >
                {!isDateRangeValid && localFromDate && localToDate ? (
                  <span className="text-xs">Fechas inválidas</span>
                ) : (
                  "Aplicar filtros"
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="default"
              >
                Restablecer
              </Button>
            </div>
          </div>

          {/* Validation Message */}
          {!isDateRangeValid && localFromDate && localToDate && (
            <div className="mt-3 text-sm text-destructive">
              La fecha final debe ser igual o posterior a la fecha inicial
            </div>
          )}

          {/* Loading indicator for offices */}
          {isLoadingOffices && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando sucursales...
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
} 