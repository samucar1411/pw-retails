"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 120, height = 40, className }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    // Return default logo during SSR
    return (
      <Image
        src="/logo-dark.png"
        alt="PowerVision Logo"
        width={width}
        height={height}
        className={className}
        priority
      />
    );
  }
  
  // Determine which logo to show
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  
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