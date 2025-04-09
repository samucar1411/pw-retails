"use client";

import * as React from "react";

import Link from "next/link";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Bell, Settings, User } from "lucide-react";

import { useEvents } from "@/context/event-context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export function DashboardHeader() {
  const { events } = useEvents();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const readStatusMapRef = React.useRef<Record<string, boolean>>({});

  // Load saved notifications and read status once on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("notifications");
    const savedReadStatus = localStorage.getItem("notificationsReadStatus");
    if (saved) {
      const parsedNotifications = JSON.parse(saved);
      setNotifications(parsedNotifications);
      if (savedReadStatus) {
        readStatusMapRef.current = JSON.parse(savedReadStatus);
      }
    }
  }, []);

  // Update notifications when events change
  React.useEffect(() => {
    const newNotifications = events.slice(0, 3).map((event) => ({
      id: event.id.toString(),
      title: `Alerta de ${event.device_name}`,
      description: `${event.staff_name} detectado en ${event.office_name}`,
      timestamp: formatDistanceToNow(new Date(event.created_at), {
        addSuffix: true,
        locale: es,
      }),
      read: readStatusMapRef.current[event.id.toString()] ?? false,
    }));

    setNotifications(newNotifications);
    localStorage.setItem("notifications", JSON.stringify(newNotifications));
  }, [events]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const markAsRead = (notificationId: string) => {
    readStatusMapRef.current[notificationId] = true;
    localStorage.setItem(
      "notificationsReadStatus",
      JSON.stringify(readStatusMapRef.current)
    );

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Remove old notifications periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        if (prev.length === 0) return prev;
        const [, ...rest] = prev;
        return rest;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex items-center gap-2"
        >
          <Input
            type="search"
            placeholder="Buscar..."
            className="h-9 w-[200px] md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="max-h-[300px] overflow-auto">
              {notifications.slice(0, 4).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {notification.description}
                  </span>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Link href="/dashboard/eventos" passHref>
              <DropdownMenuItem className="w-full text-center">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2">
            <User className="h-4 w-4" />
          </span>
        </Button>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
