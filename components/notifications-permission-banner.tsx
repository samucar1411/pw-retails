'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/context/notification-context';

export function NotificationsPermissionBanner() {
  const { pushPermission, requestPushPermission } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('notifications-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if already granted permission or dismissed
  if (pushPermission === 'granted' || isDismissed) {
    return null;
  }

  const handleRequestPermission = async () => {
    const permission = await requestPushPermission();
    if (permission === 'granted') {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notifications-banner-dismissed', 'true');
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Activar Alertas del Sistema
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Habilita las notificaciones push para recibir alertas inmediatas cuando se detecten nuevos eventos de seguridad.
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleRequestPermission}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Activar Notificaciones
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-orange-700 hover:text-orange-800 dark:text-orange-300"
              >
                Ahora no
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 