// import * as React from "react"

// import { cn } from "@/lib/utils"

// const Table = React.forwardRef<
//   HTMLTableElement,
//   React.HTMLAttributes<HTMLTableElement>
// >(({ className, ...props }, ref) => (
//   <div className="relative w-full overflow-auto">
//     <table
//       ref={ref}
//       className={cn("w-full caption-bottom text-sm", className)}
//       {...props}
//     />
//   </div>
// ))
// Table.displayName = "Table"

// const TableHeader = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
// ))
// TableHeader.displayName = "TableHeader"

// const TableBody = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <tbody
//     ref={ref}
//     className={cn("[&_tr:last-child]:border-0", className)}
//     {...props}
//   />
// ))
// TableBody.displayName = "TableBody"

// const TableFooter = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <tfoot
//     ref={ref}
//     className={cn(
//       "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
//       className
//     )}
//     {...props}
//   />
// ))
// TableFooter.displayName = "TableFooter"

// const TableRow = React.forwardRef<
//   HTMLTableRowElement,
//   React.HTMLAttributes<HTMLTableRowElement>
// >(({ className, ...props }, ref) => (
//   <tr
//     ref={ref}
//     className={cn(
//       "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
//       className
//     )}
//     {...props}
//   />
// ))
// TableRow.displayName = "TableRow"

// const TableHead = React.forwardRef<
//   HTMLTableCellElement,
//   React.ThHTMLAttributes<HTMLTableCellElement>
// >(({ className, ...props }, ref) => (
//   <th
//     ref={ref}
//     className={cn(
//       "h-10 px-4 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 border-b",
//       className
//     )}
//     {...props}
//   />
// ))
// TableHead.displayName = "TableHead"

// const TableCell = React.forwardRef<
//   HTMLTableCellElement,
//   React.TdHTMLAttributes<HTMLTableCellElement>
// >(({ className, ...props }, ref) => (
//   <td
//     ref={ref}
//     className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
//     {...props}
//   />
// ))
// TableCell.displayName = "TableCell"

// const TableCaption = React.forwardRef<
//   HTMLTableCaptionElement,
//   React.HTMLAttributes<HTMLTableCaptionElement>
// >(({ className, ...props }, ref) => (
//   <caption
//     ref={ref}
//     className={cn("mt-4 text-sm text-muted-foreground", className)}
//     {...props}
//   />
// ))
// TableCaption.displayName = "TableCaption"

// export {
//   Table,
//   TableHeader,
//   TableBody,
//   TableFooter,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableCaption,
// }









import * as React from "react";
import {
  Table as VisorTable,
  TableHeader as VisorTableHeader,
  TableBody as VisorTableBody,
  TableFooter as VisorTableFooter,
  TableRow as VisorTableRow,
  TableHead as VisorTableHead,
  TableCell as VisorTableCell,
  TableCaption as VisorTableCaption,
} from "visor-ui";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  React.ElementRef<typeof VisorTable>,
  React.ComponentPropsWithoutRef<typeof VisorTable>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <VisorTable
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  React.ElementRef<typeof VisorTableHeader>,
  React.ComponentPropsWithoutRef<typeof VisorTableHeader>
>(({ className, ...props }, ref) => (
  <VisorTableHeader
    ref={ref}
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  React.ElementRef<typeof VisorTableBody>,
  React.ComponentPropsWithoutRef<typeof VisorTableBody>
>(({ className, ...props }, ref) => (
  <VisorTableBody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  React.ElementRef<typeof VisorTableFooter>,
  React.ComponentPropsWithoutRef<typeof VisorTableFooter>
>(({ className, ...props }, ref) => (
  <VisorTableFooter
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  React.ElementRef<typeof VisorTableRow>,
  React.ComponentPropsWithoutRef<typeof VisorTableRow>
>(({ className, ...props }, ref) => (
  <VisorTableRow
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  React.ElementRef<typeof VisorTableHead>,
  React.ComponentPropsWithoutRef<typeof VisorTableHead>
>(({ className, ...props }, ref) => (
  <VisorTableHead
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 border-b",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  React.ElementRef<typeof VisorTableCell>,
  React.ComponentPropsWithoutRef<typeof VisorTableCell>
>(({ className, ...props }, ref) => (
  <VisorTableCell
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  React.ElementRef<typeof VisorTableCaption>,
  React.ComponentPropsWithoutRef<typeof VisorTableCaption>
>(({ className, ...props }, ref) => (
  <VisorTableCaption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};