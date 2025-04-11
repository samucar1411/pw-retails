import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";
import { UserProvider } from "@/context/user-context";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "next-themes";
import { Archivo } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Panel de Administración PUNTO 560",
  description: "Sistema de monitoreo de incidentes y seguridad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${archivo.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
