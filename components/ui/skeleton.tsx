// import { cn } from "@/lib/utils"

// function Skeleton({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) {
//   return (
//     <div
//       className={cn("animate-pulse rounded-md bg-muted", className)}
//       {...props}
//     />
//   )
// }

// export { Skeleton }





import { Skeleton as VisorSkeleton } from "visor-ui";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof VisorSkeleton>) {
  return (
    <VisorSkeleton
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };