"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertCircle,
  Building2,
  Users,
  Bell,
  ChevronDown,
  ChevronsUpDown,
  User,
  Settings,
  LogOut,
  PlusCircle,
  List,
  FileCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "visor-ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "visor-ui";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/context/auth-context";
import { OfficeSelectorCompact } from "@/components/office-selector";
import { OfficeProvider } from "@/context/office-context";

// Restore NavItem interface
interface NavItem {
  icon: React.ElementType;
  title: string;
  url: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    title: "Tablero",
    url: "/dashboard",
  },
  {
    icon: AlertCircle,
    title: "Incidentes",
    url: "/dashboard/incidentes",
    children: [
      {
        icon: List,
        title: "Lista de Incidentes",
        url: "/dashboard/incidentes",
      },
      {
        icon: PlusCircle,
        title: "Nuevo Incidente",
        url: "/dashboard/incidentes/nuevo",
      },
      {
        icon: FileCheck,
        title: "Denuncias Policiales",
        url: "/dashboard/incidentes/denuncias",
      },
    ],
  },
  {
    icon: Users,
    title: "Sospechosos",
    url: "/dashboard/sospechosos",
    children: [
      {
        icon: List,
        title: "Lista de Sospechosos",
        url: "/dashboard/sospechosos",
      },
      {
        icon: PlusCircle,
        title: "Agregar Sospechoso",
        url: "/dashboard/sospechosos/nuevo",
      },
    ],
  },
  {
    icon: Building2,
    title: "Sucursales",
    url: "/dashboard/sucursales",
    children: [
      {
        icon: List,
        title: "Lista de Sucursales",
        url: "/dashboard/sucursales",
      },
      {
        icon: PlusCircle,
        title: "Agregar Sucursal",
        url: "/dashboard/sucursales/nueva",
      },
    ],
  },
  {
    icon: Bell,
    title: "Alertas",
    url: "/dashboard/alertas",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  // helper para marcar item activo
  const isActive = React.useCallback(
    (path: string) =>
      path === "/dashboard"
        ? pathname === "/dashboard" || pathname === "/dashboard/"
        : pathname === path || pathname.startsWith(`${path}/`),
    [pathname]
  );

  const toggleItem = (url: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleLogout = () => logout();

  const renderNavItem = (item: NavItem) => {
    const isItemActive = isActive(item.url);
    const isExpanded = expandedItems.has(item.url);

    return (
      <React.Fragment key={item.url}>
        <Collapsible
          open={isExpanded}
          onOpenChange={() => item.children && toggleItem(item.url)}
          className="group/collapsible"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isItemActive}
              className="flex items-center justify-between w-full hover:bg-muted/80 transition-colors duration-200 rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-md ${isItemActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:bg-muted group-hover:text-foreground'} transition-colors duration-200`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.title}</span>
              </div>
              {item.children && (
                <ChevronDown
                  className={`h-4 w-4 transition-all duration-200 text-muted-foreground group-hover:text-foreground/80 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {item.children && (
            <CollapsibleContent className="mt-1 ml-2 pl-4 border-l-2 border-border/30 space-y-1">
              {item.children.map((child: NavItem) => {
                const isChildActive = isActive(child.url);
                return (
                  <Link
                    key={child.url}
                    href={child.url}
                    className={`flex items-center gap-2 py-1.5 px-3 text-sm rounded-md transition-all duration-200 ${
                      isChildActive
                        ? 'bg-primary/10 text-primary font-medium shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    } group/child`}
                  >
                    <span className={`w-1 h-1 rounded-full ${
                      isChildActive ? 'bg-primary' : 'bg-muted-foreground/40 group-hover/child:bg-foreground/60'
                    } transition-colors duration-200`}></span>
                    <span>{child.title}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          )}
        </Collapsible>
      </React.Fragment>
    );
  };

  return (
    <OfficeProvider>
      <Sidebar>
        {/* ── HEADER ─────────────────────────────────────── */}
        <SidebarHeader className="flex flex-col">
          <OfficeSelectorCompact />
        </SidebarHeader>

        {/* ── CONTENIDO ──────────────────────────────────── */}
        <SidebarContent>
          {/* ADMINISTRACIÓN */}
          <SidebarGroup>
            <SidebarGroupLabel>ADMINISTRACIÓN</SidebarGroupLabel>
            <SidebarMenu>
              {navigationItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroup>

          {/* Separador */}
          <SidebarSeparator />
        </SidebarContent>

        {/* ── FOOTER (usuario) ───────────────────────────── */}
        <SidebarFooter className="mt-auto p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between gap-2 px-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatars/user.png" alt="Usuario" />
                    <AvatarFallback>CC</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Christian Courget</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Christian Courget
                  </p>
                  <p className="text-xs text-muted-foreground">
                    c.courget@powervision.ai
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-destructive">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>

        {/* ── RAIL (versión colapsada) ───────────────────── */}
        <SidebarRail />
      </Sidebar>
    </OfficeProvider>
  );
}