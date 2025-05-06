"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "visor-ui";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Branch, useBranch } from "@/hooks/use-branch";

type Props = { branches: Branch[] };

export const BranchSelectorCompact = ({ branches }: Props) => {
  const { branch, setBranch } = useBranch();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-full justify-start gap-3 px-2 hover:bg-muted/10"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={branch.logoUrl} alt={branch.name} />
            <AvatarFallback className="text-[10px]">
              {branch.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-medium leading-none">
              {branch.name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {branch.address}
            </span>
          </div>

          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0">
        <Command shouldFilter>
          <CommandInput placeholder="Buscar sucursal…" className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró ninguna.</CommandEmpty>

            {branches.map((b) => (
              <CommandItem
                key={b.id}
                value={b.name}
                className="flex items-start gap-3 py-2"
                onSelect={() => {
                  setBranch(b);
                  setOpen(false);
                }}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={b.logoUrl} alt={b.name} />
                  <AvatarFallback className="text-[10px]">
                    {b.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm">{b.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {b.address}
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