'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/event';

export interface Notification {
  id: string;
  event: Event;
  timestamp: Date;
  viewed: boolean;
  type: 'event';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pushPermission: NotificationPermission;
  addNotification: (event: Event) => void;
  markAsViewed: (notificationId: string) => void;
  markAllAsViewed: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getUnreadNotifications: () => Notification[];
  requestPushPermission: () => Promise<NotificationPermission>;
  showPushNotification: (title: string, body: string, event?: Event) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'pw-retails-notifications';
const MAX_NOTIFICATIONS = 50; // Limit stored notifications

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Load notifications from localStorage on mount and check push permission
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const restoredNotifications = parsed.map((n: Notification & { timestamp: string }) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(restoredNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }

    // Check current notification permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }, [notifications]);

  const requestPushPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission;
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return 'denied';
    }
  }, []);

  const showPushNotification = useCallback((title: string, body: string, event?: Event) => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('No se tienen permisos para mostrar notificaciones');
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo-light.png',
        badge: '/logo-light.png',
        tag: event ? `event-${event.id}` : `notification-${Date.now()}`,
        requireInteraction: true, // Keep notification until user interacts
        silent: false, // Play default sound
        data: event ? { eventId: event.id, type: 'event' } : { type: 'system' }
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // If it's an event notification, navigate to events page
        if (event) {
          window.location.href = '/dashboard/eventos';
        }
      };

      // Auto-close after 5 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  }, []);

  const addNotification = useCallback((event: Event) => {
    const newNotification: Notification = {
      id: `${event.id}-${Date.now()}`,
      event,
      timestamp: new Date(),
      viewed: false,
      type: 'event'
    };

    setNotifications(prev => {
      // Check if we already have a notification for this event
      const existingIndex = prev.findIndex(n => n.event.id === event.id);
      
      let updated: Notification[];
      if (existingIndex >= 0) {
        // Update existing notification
        updated = [...prev];
        updated[existingIndex] = newNotification;
      } else {
        // Add new notification at the beginning
        updated = [newNotification, ...prev];
      }

      // Limit the number of stored notifications
      if (updated.length > MAX_NOTIFICATIONS) {
        updated = updated.slice(0, MAX_NOTIFICATIONS);
      }

      return updated;
    });

    // Show enhanced push notification
    showPushNotification(
      '🚨 Nueva Alerta del Sistema',
      `${event.staff_name} detectado en ${event.office_name} (${event.device_name})`,
      event
    );
  }, [showPushNotification]);

  const markAsViewed = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, viewed: true } : n
      )
    );
  }, []);

  const markAllAsViewed = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, viewed: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.viewed);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.viewed).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    pushPermission,
    addNotification,
    markAsViewed,
    markAllAsViewed,
    removeNotification,
    clearAllNotifications,
    getUnreadNotifications,
    requestPushPermission,
    showPushNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 