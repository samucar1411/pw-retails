'use client';

import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WebSocketStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
  onReconnect?: () => void;
}

export function WebSocketStatus({ isConnected, reconnectAttempts, onReconnect }: WebSocketStatusProps) {
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Conectado',
        variant: 'default' as const,
        color: 'text-green-600',
        description: 'Recibiendo eventos en tiempo real'
      };
    } else if (reconnectAttempts > 0) {
      return {
        icon: AlertCircle,
        text: 'Reconectando...',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        description: `Intento ${reconnectAttempts} de reconexión`
      };
    } else {
      return {
        icon: WifiOff,
        text: 'Desconectado',
        variant: 'destructive' as const,
        color: 'text-red-600',
        description: 'Sin conexión en tiempo real'
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="gap-1">
              <Icon className="h-3 w-3" />
              <span className="text-xs">{status.text}</span>
            </Badge>
            {!isConnected && onReconnect && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReconnect}
                className="h-6 px-2 text-xs"
              >
                Reconectar
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{status.description}</p>
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-1">
              Las notificaciones pueden tener retraso
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 