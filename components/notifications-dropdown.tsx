'use client';

import React from 'react';
import { Bell, Calendar, Eye, Trash2, X, BellOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/context/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    pushPermission,
    markAsViewed,
    markAllAsViewed,
    removeNotification,
    clearAllNotifications,
    requestPushPermission,
  } = useNotifications();

  const handleMarkAsViewed = (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    markAsViewed(notificationId);
  };

  const handleRemoveNotification = (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    removeNotification(notificationId);
  };

  // Request notification permission on component mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-semibold">Notificaciones</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsViewed}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            </div>
          )}
        </div>

        {/* Push Notification Status */}
        {pushPermission !== 'granted' && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950 border-b">
            <div className="flex items-center gap-2">
              {pushPermission === 'denied' ? (
                <BellOff className="h-4 w-4 text-orange-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
                  {pushPermission === 'denied' 
                    ? 'Notificaciones bloqueadas' 
                    : 'Notificaciones desactivadas'
                  }
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  {pushPermission === 'denied'
                    ? 'Habilita en configuración del navegador'
                    : 'Activa para recibir alertas inmediatas'
                  }
                </p>
              </div>
              {pushPermission !== 'denied' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestPushPermission}
                  className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Activar
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                  !notification.viewed ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <Link 
                  href="/dashboard/eventos" 
                  onClick={() => handleMarkAsViewed(notification.id)}
                  className="block"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        !notification.viewed ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          Nuevo Evento
                        </p>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.viewed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => handleMarkAsViewed(notification.id, e)}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => handleRemoveNotification(notification.id, e)}
                            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.event.staff_name} - {notification.event.office_name}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.timestamp, { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Link href="/dashboard/eventos">
                <Button variant="ghost" className="w-full justify-center text-sm">
                  Ver todos los eventos
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
} 