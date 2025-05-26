import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Verificar preferencia de tema al cargar
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Función para actualizar el tema
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Establecer el tema inicial
    updateTheme(darkModeMediaQuery);

    // Escuchar cambios en la preferencia de tema
    darkModeMediaQuery.addEventListener('change', updateTheme);
    
    // Limpiar el event listener al desmontar
    return () => {
      darkModeMediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return theme;
}
