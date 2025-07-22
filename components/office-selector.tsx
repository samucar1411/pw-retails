"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Office } from "@/types/office";
import { useOffice } from "@/context/office-context";

export const OfficeSelectorCompact = () => {
  const { offices, selectedOffice, selectOffice, isLoading, error } = useOffice();
  const [open, setOpen] = React.useState(false);

  const handleSelectOffice = (office: Office) => {
    selectOffice(office);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-12 w-full justify-start gap-3 px-2">
        Cargando sucursales...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="ghost" size="sm" className="h-12 w-full justify-start gap-3 px-2 text-destructive">
        Error cargando sucursales
      </Button>
    );
  }

  if (!selectedOffice) {
    return (
      <Button variant="ghost" size="sm" className="h-12 w-full justify-start gap-3 px-2">
        Ninguna oficina seleccionada
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-full justify-start gap-3 px-2 hover:bg-muted/10"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-[10px]">
              {selectedOffice.Name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-medium leading-none">
              {selectedOffice.Name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {selectedOffice.Address}
            </span>
          </div>

          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0">
        <Command shouldFilter>
          <CommandInput placeholder="Buscar oficina…" className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró ninguna.</CommandEmpty>

            {offices.slice(0, 3).map((o) => (
              <CommandItem
                key={o.id}
                value={o.Name}
                className="flex items-start gap-3 py-2 hover:bg-secondary"
                onSelect={() => handleSelectOffice(o)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {o.Name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm">{o.Name}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.Address}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
