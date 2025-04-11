import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import { SidebarNav } from "./components/sidebar-nav"

const sidebarNavItems = [
  {
    title: "General",
    href: "/dashboard/settings",
  },
  {
    title: "Monedas",
    href: "/dashboard/settings/currencies",
  },
  {
    title: "Nacionalidades",
    href: "/dashboard/settings/nationalities",
  },
  {
    title: "Idiomas",
    href: "/dashboard/settings/languages",
  },
  {
    title: "Ciudades",
    href: "/dashboard/settings/cities",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <Container className="py-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administra la configuración del sistema y datos maestros.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">{children}</div>
      </div>
    </Container>
  )
} 