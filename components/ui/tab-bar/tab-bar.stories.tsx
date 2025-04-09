import { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "./tab-bar";
import { Mail, Settings, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";

const meta: Meta<typeof TabBar> = {
  title: "Components/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    tabs: {
      control: "object",
      description: "Lista de pestañas",
    },
    className: {
      control: "text",
      description: "Clases CSS personalizadas",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { title: "Bandeja de entrada", href: "/inbox", icon: Mail },
      { title: "Perfil", href: "/profile", icon: User },
      { title: "Configuración", href: "/settings", icon: Settings },
    ],
  },
  render: (args) => {
    const activeTab = "inbox";
    const showIcons = true; // Controla la visibilidad de los iconos aquí
    return (
      <Tabs value={activeTab} className={args.className}>
        <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
          {args.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.href} value={tab.href.split("/").pop() || ""}>
                {showIcons && Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  },
};

export const CustomTabs: Story = {
  args: {
    tabs: [
      { title: "Inicio", href: "/home" },
      { title: "Acerca de", href: "/about" },
      { title: "Contacto", href: "/contact" },
    ],
  },
  render: (args) => {
    const activeTab = "home";
    const showIcons = false; // Controla la visibilidad de los iconos aquí
    return (
      <Tabs value={activeTab} className={args.className}>
        <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
          {args.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.href} value={tab.href.split("/").pop() || ""}>
                {showIcons && Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  },
};

export const CustomClassName: Story = {
  args: {
    tabs: [
      { title: "Bandeja de entrada", href: "/inbox", icon: Mail },
      { title: "Perfil", href: "/profile", icon: User },
      { title: "Configuración", href: "/settings", icon: Settings },
    ],
    className: "border border-blue-500 rounded-md p-4",
  },
  render: (args) => {
    const activeTab = "profile";
    const showIcons = true; // Controla la visibilidad de los iconos aquí
    return (
      <Tabs value={activeTab} className={args.className}>
        <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
          {args.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.href} value={tab.href.split("/").pop() || ""}>
                {showIcons && Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  },
};

export const EmptyTabs: Story = {
  args: {
    tabs: [],
  },
  render: (args) => {
    const activeTab = "";
    const showIcons = true; // Controla la visibilidad de los iconos aquí
    return (
      <Tabs value={activeTab} className={args.className}>
        <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
          {args.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.href} value={tab.href.split("/").pop() || ""}>
                {showIcons && Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  },
};