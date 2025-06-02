"use client";

import * as React from "react";
import { Button } from "visor-ui";
import { Check, Circle } from "lucide-react";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)}>Opciones</Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
    >
      {children}
    </div>
  );
};

const DropdownMenuCheckboxItem = ({
  children,
  checked,
  onClick,
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      {checked && <Check className="mr-2 h-4 w-4 inline" />}
      {children}
    </DropdownMenuItem>
  );
};

const DropdownMenuRadioItem = ({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      {selected && <Circle className="mr-2 h-2 w-2 fill-current inline" />}
      {children}
    </DropdownMenuItem>
  );
};

const DropdownMenuSeparator = () => {
  return <div className="my-1 h-px bg-gray-200" />;
};

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
};