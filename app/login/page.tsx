'use client';

import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeLogo } from '@/components/theme-logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-0">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-8">
              <ThemeLogo width={200} height={40} />
            </div>
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
