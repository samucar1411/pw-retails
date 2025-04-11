"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  AlertCircle,
  ChevronDown,
  Clock,
  Target,
  Car,
  Bell,
  User,
  LogOut,
  ChevronsUpDown,
  Building2,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";

interface NavItem {
  icon: React.ElementType;
  title: string;
  url: string;
  subItems?: { title: string; url: string }[];
}

const platformItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    title: "Tablero",
    url: "/dashboard",
  },
  {
    icon: Building2,
    title: "Clientes",
    url: "/dashboard/clientes",
  },
  {
    icon: Users,
    title: "Usuarios",
    url: "/dashboard/usuarios",
  },
  {
    icon: AlertCircle,
    title: "Eventos",
    url: "/dashboard/eventos",
  },
];

const projectItems: NavItem[] = [
  {
    icon: Users,
    title: "Comunidad",
    url: "/dashboard/comunidad",
  },
  {
    icon: Clock,
    title: "Incidentes",
    url: "/dashboard/incidentes",
  },
  {
    icon: Target,
    title: "Sospechosos",
    url: "/dashboard/sospechosos",
  },
  {
    icon: Car,
    title: "Vehículos",
    url: "/dashboard/vehiculos",
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

  const handleLogout = async () => {
    logout();
  };

  const isPathActive = React.useCallback(
    (path: string) => {
      if (path === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/dashboard/";
      }
      // For other routes, check if the current path matches exactly or is a subpath
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Logo width={180} height={18} />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ADMINISTRACIÓN</SidebarGroupLabel>
          <SidebarMenu>
            {platformItems.map((item) =>
              item.subItems ? (
                <React.Fragment key={item.title}>
                  <SidebarMenuSub>
                    <SidebarMenuSubButton>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </SidebarMenuSubButton>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        isActive={isPathActive(subItem.url)}
                      >
                        <Link href={subItem.url} className="flex w-full">
                          {subItem.title}
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </React.Fragment>
              ) : (
                <SidebarMenuButton
                  key={item.title}
                  asChild
                  isActive={isPathActive(item.url)}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>INTELIGENCIA</SidebarGroupLabel>
          <SidebarMenu>
            {projectItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                disabled
                isActive={isPathActive(item.url)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarFooter className="mt-auto p-4">
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between gap-2 px-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src="/avatars/user.png"
                        alt="Samuel Cárdenas"
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Samuel Cárdenas</span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 transition duration-200 data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Samuel Cárdenas</p>
                    <p className="text-xs text-muted-foreground">
                      s@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
