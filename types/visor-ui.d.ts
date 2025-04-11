declare module 'visor-ui' {
  import * as React from 'react';
  
  // Componentes básicos
  export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
  }>;
  
  export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Componentes de formulario
  export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
  export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
  export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>>;
  export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
  export const RadioGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const RadioGroupItem: React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
  
  // Componentes de layout
  export const AspectRatio: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    ratio?: number;
  }>;
  
  export const Sheet: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;
  
  export const SheetTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
  export const SheetContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  
  // Componentes de navegación
  export const Tabs: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TabsTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
  export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Componentes de feedback
  export const Toast: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  export const ToastProvider: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Componentes de calendario/fecha
  export const Calendar: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    mode?: 'single' | 'multiple' | 'range';
    selected?: Date | Date[] | { from: Date; to: Date };
    onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
    disabled?: boolean | ((date: Date) => boolean);
    initialFocus?: boolean;
  }>;
  
  // Componentes de popover/dropdown
  export const DropdownMenu: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
  export const DropdownMenuContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuCheckboxItem: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuRadioItem: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Componentes de feedback de usuario
  export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}
