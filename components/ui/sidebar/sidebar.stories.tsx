import { Meta, StoryObj } from "@storybook/react";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarSeparator,
  SidebarInput,
} from "./sidebar";
import { Button } from "@/components/ui/button/button";
import { Search, Settings, User } from "lucide-react";

// Extendemos el tipo del componente Sidebar con propiedades personalizadas
type SidebarProps = React.ComponentProps<typeof Sidebar> & {
  searchPlaceholder?: string;
  menuLabel?: string;
  subMenuLabel?: string;
  dashboardText?: string;
  usersText?: string;
  settingsText?: string;
  logoutText?: string;
  subItemAText?: string;
  subItemBText?: string;
};

const meta: Meta<SidebarProps> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "radio" },
      options: ["left", "right"],
    },
    variant: {
      control: { type: "radio" },
      options: ["sidebar", "floating", "inset"],
    },
    collapsible: {
      control: { type: "radio" },
      options: ["offcanvas", "icon", "none"],
    },
    searchPlaceholder: {
      control: { type: "text" },
      defaultValue: "Search...",
    },
    menuLabel: {
      control: { type: "text" },
      defaultValue: "Menu",
    },
    subMenuLabel: {
      control: { type: "text" },
      defaultValue: "Sub Menu",
    },
    dashboardText: {
      control: { type: "text" },
      defaultValue: "Dashboard",
    },
    usersText: {
      control: { type: "text" },
      defaultValue: "Users",
    },
    settingsText: {
      control: { type: "text" },
      defaultValue: "Settings",
    },
    logoutText: {
      control: { type: "text" },
      defaultValue: "Logout",
    },
    subItemAText: {
      control: { type: "text" },
      defaultValue: "Sub Item A",
    },
    subItemBText: {
      control: { type: "text" },
      defaultValue: "Sub Item B",
    },
  },
};

export default meta;

type Story = StoryObj<SidebarProps>;

export const Default: Story = {
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "offcanvas",
    searchPlaceholder: "Search...",
    menuLabel: "Menu",
    subMenuLabel: "Sub Menu",
    dashboardText: "Dashboard",
    usersText: "Users",
    settingsText: "Settings",
    logoutText: "Logout",
    subItemAText: "Sub Item A",
    subItemBText: "Sub Item B",
  },
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarInput placeholder={args.searchPlaceholder} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{args.menuLabel}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.dashboardText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.usersText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.settingsText}</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>{args.subMenuLabel}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Sub Menu Item 1</SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>
                      {args.subItemAText}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>
                      {args.subItemBText}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button>{args.logoutText}</Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <div className="p-4">
          <p>Main content area.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const Floating: Story = {
  args: {
    side: "left",
    variant: "floating",
    collapsible: "icon",
    searchPlaceholder: "Search...",
    menuLabel: "Menu",
    dashboardText: "Dashboard",
    usersText: "Users",
    settingsText: "Settings",
    logoutText: "Logout",
  },
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarInput placeholder={args.searchPlaceholder} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{args.menuLabel}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={args.dashboardText}>
                  <Search />
                  <span>{args.dashboardText}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={args.usersText}>
                  <User />
                  <span>{args.usersText}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={args.settingsText}>
                  <Settings />
                  <span>{args.settingsText}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button>{args.logoutText}</Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <div className="p-4">
          <p>Main content area.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const Inset: Story = {
  args: {
    side: "left",
    variant: "inset",
    collapsible: "none",
    searchPlaceholder: "Search...",
    menuLabel: "Menu",
    dashboardText: "Dashboard",
    usersText: "Users",
    settingsText: "Settings",
    logoutText: "Logout",
  },
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarInput placeholder={args.searchPlaceholder} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{args.menuLabel}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.dashboardText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.usersText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.settingsText}</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button>{args.logoutText}</Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">
          <p>Main content area.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  args: {
    side: "right",
    variant: "sidebar",
    collapsible: "offcanvas",
    searchPlaceholder: "Search...",
    menuLabel: "Menu",
    dashboardText: "Dashboard",
    usersText: "Users",
    settingsText: "Settings",
    logoutText: "Logout",
  },
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarInput placeholder={args.searchPlaceholder} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{args.menuLabel}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.dashboardText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.usersText}</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>{args.settingsText}</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button>{args.logoutText}</Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <div className="p-4">
          <p>Main content area.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
