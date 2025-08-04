'use client';

import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeLogo } from '@/components/theme-logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md mx-auto z-10">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <ThemeLogo width={220} height={44} />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Bienvenido
              </CardTitle>
              <CardDescription className="text-muted-foreground">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <LoginForm />
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 PW Retails. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
