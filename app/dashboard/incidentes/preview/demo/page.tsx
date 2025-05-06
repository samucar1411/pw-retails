'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { loadMockData } from '../mock-data';

export default function DemoPreviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupDemo = async () => {
      try {
        // Cargar datos de ejemplo
        loadMockData();
        
        // Pequeña pausa para asegurar que los datos se guarden en localStorage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirigir a la página de preview
        router.push('/dashboard/incidentes/preview');
      } catch (error) {
        console.error("Error al preparar la demostración:", error);
        setIsLoading(false);
      }
    };

    setupDemo();
  }, [router]);

  const handleManualNavigation = () => {
    // Asegurar que los datos están cargados antes de navegar
    loadMockData();
    router.push('/dashboard/incidentes/preview');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">
          {isLoading ? "Cargando demostración..." : "No se pudo cargar automáticamente"}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {isLoading 
            ? "Estamos preparando una versión de demostración del reporte con datos de ejemplo."
            : "Hubo un problema al cargar automáticamente la demostración. Puedes intentar acceder manualmente."}
        </p>
        
        <Button 
          onClick={handleManualNavigation} 
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando...
            </>
          ) : (
            "Ver demostración manualmente"
          )}
        </Button>
      </div>
    </div>
  );
} 