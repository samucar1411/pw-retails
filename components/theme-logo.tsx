"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 200, height = 40, className = '' }: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Asegurar que el componente esté montado antes de usar el tema
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Usar resolvedTheme para obtener el tema actual (dark/light)
  const currentTheme = mounted ? (resolvedTheme || theme || 'light') : 'light';
  
  // Seleccionar el logo apropiado según el tema
  const logoSrc = currentTheme === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  return (
    <Image
      src={logoSrc}
      alt="PowerVision Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
} 