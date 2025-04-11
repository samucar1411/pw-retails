"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Actualizando los componentes para usar genéricos
type SelectProps<T extends string> = React.HTMLAttributes<HTMLDivElement> & {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
};

const Select = React.forwardRef(
  <T extends string>(
    { className, children, value, defaultValue, onValueChange, ...props }: SelectProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<T | undefined>(
      value || defaultValue
    );

    // Actualizar el valor seleccionado si cambia desde props
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = (value: T) => {
      setSelectedValue(value);
      onValueChange?.(value);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={cn("relative inline-block w-full", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pasamos las props internas sin exponerlas al DOM
            const childProps = {
              _isOpen: isOpen,
              _setIsOpen: setIsOpen,
              _selectedValue: selectedValue,
              _onValueChange: handleValueChange,
            };
            return React.cloneElement(child as React.ReactElement<any>, childProps);
          }
          return child;
        })}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    _isOpen?: boolean;
    _setIsOpen?: (isOpen: boolean) => void;
    _selectedValue?: string;
  }
>(({ className, children, _isOpen, _setIsOpen, _selectedValue, ...props }, ref) => {
  const handleClick = () => {
    _setIsOpen?.(!_isOpen);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
    _selectedValue?: string;
  }
>(({ className, placeholder, _selectedValue, ...props }, ref) => {
  return (
    <span ref={ref} className={cn("flex-grow truncate", className)} {...props}>
      {_selectedValue || placeholder || "Select an option"}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    _isOpen?: boolean;
    align?: "start" | "center" | "end";
  }
>(({ className, _isOpen, align = "start", children, ...props }, ref) => {
  if (!_isOpen) return null;

  const alignClass = 
    align === "start" ? "left-0" : 
    align === "end" ? "right-0" : 
    "left-1/2 transform -translate-x-1/2";

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        alignClass,
        "w-full",
        className
      )}
      {...props}
    >
      <div className="p-1 overflow-auto max-h-60">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

type SelectItemProps<T extends string> = Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> & {
  value: T;
  _selectedValue?: string;
  _onValueChange?: (value: T) => void;
};

const SelectItem = React.forwardRef(
  <T extends string>(
    { className, children, value, _selectedValue, _onValueChange, ...props }: SelectItemProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const isSelected = _selectedValue === value;
    
    // Crear un handler que no exponga onValueChange al DOM
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (_onValueChange) {
        _onValueChange(value);
      }
    }, [_onValueChange, value]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("overflow-hidden p-1", className)}
      {...props}
    />
  );
});
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
});
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};