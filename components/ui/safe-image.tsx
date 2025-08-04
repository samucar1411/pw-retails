'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function SafeImage({ 
  src, 
  alt, 
  width = 40, 
  height = 40, 
  className = '',
  fallbackIcon = <User className="h-4 w-4 text-muted-foreground" />
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized={process.env.NODE_ENV === 'production'} // Evitar problemas de optimización en producción
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
} 