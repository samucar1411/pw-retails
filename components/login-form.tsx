'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface ApiError {
  data?: {
    non_field_errors?: string[];
  };
  message?: string;
}

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        toast({
          title: 'Error de autenticación',
          description: 'Usuario o contraseña incorrectos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError?.data?.non_field_errors?.[0] || 
                         apiError?.message || 
                         'Ocurrió un error al intentar iniciar sesión';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-foreground">
            Usuario
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
              id="username"
          type="text"
              placeholder="Ingrese su usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          required
              className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
              className="pl-10 pr-10 bg-background border-border focus:border-primary focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Iniciando sesión...
          </div>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  );
}
