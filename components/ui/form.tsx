// "use client";

// import * as React from "react";
// import * as LabelPrimitive from "@radix-ui/react-label";
// import { Slot } from "@radix-ui/react-slot";
// import {
//   Controller,
//   ControllerProps,
//   FieldPath,
//   FieldValues,
//   FormProvider,
//   useFormContext,
// } from "react-hook-form";

// import { cn } from "@/lib/utils";
// import { Label } from "@/components/ui/label";

// const Form = FormProvider;

// type FormFieldContextValue<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
// > = {
//   name: TName;
// };

// const FormFieldContext = React.createContext<FormFieldContextValue>(
//   {} as FormFieldContextValue
// );

// const FormField = <
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
// >({
//   ...props
// }: ControllerProps<TFieldValues, TName>) => {
//   return (
//     <FormFieldContext.Provider value={{ name: props.name }}>
//       <Controller {...props} />
//     </FormFieldContext.Provider>
//   );
// };

// const useFormField = () => {
//   const fieldContext = React.useContext(FormFieldContext);
//   const itemContext = React.useContext(FormItemContext);
//   const { getFieldState, formState } = useFormContext();

//   const fieldState = getFieldState(fieldContext.name, formState);

//   if (!fieldContext) {
//     throw new Error("useFormField should be used within <FormField>");
//   }

//   const { id } = itemContext;

//   return {
//     id,
//     name: fieldContext.name,
//     formItemId: `${id}-form-item`,
//     formDescriptionId: `${id}-form-item-description`,
//     formMessageId: `${id}-form-item-message`,
//     ...fieldState,
//   };
// };

// type FormItemContextValue = {
//   id: string;
// };

// const FormItemContext = React.createContext<FormItemContextValue>(
//   {} as FormItemContextValue
// );

// const FormItem = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => {
//   const id = React.useId();

//   return (
//     <FormItemContext.Provider value={{ id }}>
//       <div ref={ref} className={cn("space-y-2", className)} {...props} />
//     </FormItemContext.Provider>
//   );
// });
// FormItem.displayName = "FormItem";

// const FormLabel = React.forwardRef<
//   React.ElementRef<typeof LabelPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
// >(({ className, ...props }, ref) => {
//   const { error, formItemId } = useFormField();

//   return (
//     <Label
//       ref={ref}
//       className={cn(error && "text-destructive", className)}
//       htmlFor={formItemId}
//       {...props}
//     />
//   );
// });
// FormLabel.displayName = "FormLabel";

// const FormControl = React.forwardRef<
//   React.ElementRef<typeof Slot>,
//   React.ComponentPropsWithoutRef<typeof Slot>
// >(({ ...props }, ref) => {
//   const { error, formItemId, formDescriptionId, formMessageId } =
//     useFormField();

//   return (
//     <Slot
//       ref={ref}
//       id={formItemId}
//       aria-describedby={
//         !error
//           ? `${formDescriptionId}`
//           : `${formDescriptionId} ${formMessageId}`
//       }
//       aria-invalid={!!error}
//       {...props}
//     />
//   );
// });
// FormControl.displayName = "FormControl";

// const FormDescription = React.forwardRef<
//   HTMLParagraphElement,
//   React.HTMLAttributes<HTMLParagraphElement>
// >(({ className, ...props }, ref) => {
//   const { formDescriptionId } = useFormField();

//   return (
//     <p
//       ref={ref}
//       id={formDescriptionId}
//       className={cn("text-sm text-muted-foreground", className)}
//       {...props}
//     />
//   );
// });
// FormDescription.displayName = "FormDescription";

// const FormMessage = React.forwardRef<
//   HTMLParagraphElement,
//   React.HTMLAttributes<HTMLParagraphElement>
// >(({ className, children, ...props }, ref) => {
//   const { error, formMessageId } = useFormField();
//   const body = error ? String(error?.message) : children;

//   if (!body) {
//     return null;
//   }

//   return (
//     <p
//       ref={ref}
//       id={formMessageId}
//       className={cn("text-sm font-medium text-destructive", className)}
//       {...props}
//     >
//       {body}
//     </p>
//   );
// });
// FormMessage.displayName = "FormMessage";

// export {
//   useFormField,
//   Form,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormDescription,
//   FormMessage,
//   FormField,
// };





"use client";

import * as React from "react";
import { Form as VisorForm, Input, Label } from "visor-ui";

import { cn } from "@/lib/utils";

const Form = ({ children, ...props }: React.ComponentProps<typeof VisorForm>) => {
  return <VisorForm {...props}>{children}</VisorForm>;
};

const FormItem = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

const FormLabel = ({ children, htmlFor, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <Label htmlFor={htmlFor} className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </Label>
  );
};

const FormControl = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <Input ref={ref} className={cn("w-full", className)} {...props} />;
  }
);
FormControl.displayName = "FormControl";

const FormDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

const FormMessage = ({ error, className, ...props }: { error?: string } & React.HTMLAttributes<HTMLParagraphElement>) => {
  if (!error) return null;

  return (
    <p className={cn("text-sm text-destructive", className)} {...props}>
      {error}
    </p>
  );
};

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };