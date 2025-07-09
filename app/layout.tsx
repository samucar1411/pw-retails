import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "next-themes";
import { Archivo } from "next/font/google";
import { Toaster } from 'sonner';
import { IncidentProvider } from "@/context/incident-context";
import { SuspectProvider } from "@/context/suspect-context";
import { NotificationProvider } from "@/context/notification-context";
import { ReactQueryClientProvider } from "./providers/react-query-provider";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "PW Retails - Gestión de Incidentes",
  description: "Plataforma para la gestión de incidentes en tiendas minoristas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${archivo.variable} antialiased`} suppressHydrationWarning>
        <ReactQueryClientProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NotificationProvider>
                <IncidentProvider>
                  <SuspectProvider>
                    {children}
                  </SuspectProvider>
                </IncidentProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryClientProvider>
        <Toaster 
          richColors 
          closeButton 
          theme="system"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
