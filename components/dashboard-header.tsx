"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { WebSocketStatus } from "@/components/websocket-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  SidebarTrigger,
} from "visor-ui";
import { useAuth } from "@/context/auth-context";
import { useWebSocketStatus } from "@/context/websocket-context";

// Helper function to get page title from pathname
const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length <= 1) return 'Tablero';
  
  const pageMap: Record<string, string> = {
    'incidentes': 'Incidentes',
    'sospechosos': 'Sospechosos', 
    'eventos': 'Eventos',
    'usuarios': 'Usuarios',
    'sucursales': 'Sucursales',
    'settings': 'Configuración',
    'nuevo': 'Nuevo',
    'crear': 'Crear',
    'editar': 'Editar',
    'denuncias': 'Denuncias',
    'preview': 'Vista Previa'
  };
  
  const lastSegment = segments[segments.length - 1];
  return pageMap[lastSegment] || 'Dashboard';
};

// Helper function to generate breadcrumbs
const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length <= 1) return [];
  
  const breadcrumbs = [];
  let currentPath = '';
  
  for (let i = 1; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    
    // Skip numeric IDs in breadcrumbs
    if (!/^\d+$/.test(segments[i])) {
      breadcrumbs.push({
        label: getPageTitle(`/${segments[i]}`),
        path: currentPath,
        isLast
      });
    }
  }
  
  return breadcrumbs;
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { userInfo, logout } = useAuth();
  const { isConnected, reconnectAttempts, connect } = useWebSocketStatus();
  const pageTitle = getPageTitle(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

    const getUserInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (userInfo?.first_name && userInfo?.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }
    if (userInfo?.first_name) {
      return userInfo.first_name;
    }
    return 'Usuario';
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          <div className="flex items-center gap-2">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Link 
                  href="/dashboard" 
                  className="hover:text-foreground transition-colors"
                >
                  Inicio
                </Link>
                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.path}>
                    <ChevronRight className="h-3 w-3" />
                    {crumb.isLast ? (
                      <span className="text-foreground font-medium">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link 
                        href={crumb.path}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Page title for mobile */}
            <h1 className="sm:hidden text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <WebSocketStatus 
            isConnected={isConnected} 
            reconnectAttempts={reconnectAttempts} 
            onReconnect={connect}
          />
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationsDropdown />
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* User menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials(userInfo?.first_name, userInfo?.last_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              {/* User info section */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials(userInfo?.first_name, userInfo?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{getUserDisplayName()}</p>
                  {userInfo?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {userInfo.email}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-2">
                <Link href="/dashboard/profile">
                  <Button variant="ghost" className="w-full justify-start h-9 px-3">
                    <User className="mr-3 h-4 w-4" />
                    <span>Perfil</span>
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" className="w-full justify-start h-9 px-3">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Configuración</span>
                  </Button>
                </Link>
                <div className="my-1">
                  <Separator />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
