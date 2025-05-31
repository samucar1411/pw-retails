'use client';

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  text?: string;
  variant?: 'default' | 'card' | 'inline' | 'skeleton';
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingState({
  text = "Cargando...",
  variant = 'default',
  count = 1,
  height = "h-12",
  className = "",
}: LoadingStateProps) {
  // Inline loading indicator
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{text}</span>
      </div>
    );
  }

  // Card with centered loading indicator
  if (variant === 'card') {
    return (
      <Card className={`flex items-center justify-center ${height} ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>{text}</p>
        </div>
      </Card>
    );
  }

  // Multiple skeleton items
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className={`${height} w-full`} />
        ))}
      </div>
    );
  }

  // Default centered loading indicator
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
