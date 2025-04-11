// "use client"

// import { useToast } from "@/hooks/use-toast"
// import {
//   Toast,
//   ToastClose,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "@/components/ui/toast"

// export function Toaster() {
//   const { toasts } = useToast()

//   return (
//     <ToastProvider>
//       {toasts.map(function ({ id, title, description, action, ...props }) {
//         return (
//           <Toast key={id} {...props}>
//             <div className="grid gap-1">
//               {title && <ToastTitle>{title}</ToastTitle>}
//               {description && (
//                 <ToastDescription>{description}</ToastDescription>
//               )}
//             </div>
//             {action}
//             <ToastClose />
//           </Toast>
//         )
//       })}
//       <ToastViewport />
//     </ToastProvider>
//   )
// }








"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast as VisorToast,
  ToastClose as VisorToastClose,
  ToastDescription as VisorToastDescription,
  ToastProvider as VisorToastProvider,
  ToastTitle as VisorToastTitle,
  ToastViewport as VisorToastViewport,
} from "visor-ui";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <VisorToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <VisorToast key={id} {...props}>
            <div className="grid gap-1">
              {title && <VisorToastTitle>{title}</VisorToastTitle>}
              {description && (
                <VisorToastDescription>{description}</VisorToastDescription>
              )}
            </div>
            {action}
            <VisorToastClose />
          </VisorToast>
        );
      })}
      <VisorToastViewport />
    </VisorToastProvider>
  );
}