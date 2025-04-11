import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en tu cuenta",
}

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="/login.png" 
            alt="Authentication background"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo width={160} height={80} />
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de vuelta</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2">
              <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
