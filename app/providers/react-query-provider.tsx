'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface ReactQueryClientProviderProps {
  children: ReactNode;
}

export function ReactQueryClientProvider({ children }: ReactQueryClientProviderProps) {
  // Crear una instancia de QueryClient para React Query con configuración optimizada
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos por defecto
        gcTime: 10 * 60 * 1000, // 10 minutos (reemplaza cacheTime en v5)
        retry: 1, // Reducir reintentos
        refetchOnWindowFocus: false, // Evitar refetch automático
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
