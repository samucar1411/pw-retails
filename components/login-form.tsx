'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
