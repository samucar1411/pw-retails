"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sheet: React.FC<SheetProps> = ({ 
  children, 
  open = false, 
  onOpenChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };

  return (
    <SheetContext.Provider value={{ isOpen, setOpen: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};
Sheet.displayName = "Sheet";

interface SheetContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType>({
  isOpen: false,
  setOpen: () => {},
});

const useSheetContext = () => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("useSheetContext must be used within a SheetProvider");
  }
  return context;
};

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(true)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(false)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  );
});
SheetClose.displayName = "SheetClose";

const SheetPortal: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isOpen } = useSheetContext();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {children}
    </div>
  );
};
SheetPortal.displayName = "SheetPortal";

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 transition-opacity",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
});
SheetOverlay.displayName = "SheetOverlay";

const getSheetSideClasses = (side: "top" | "right" | "bottom" | "left") => {
  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  };
  
  return sideClasses[side] || sideClasses.right;
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  
  return (
    <SheetPortal>
      <SheetOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          getSheetSideClasses(side),
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
    </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};