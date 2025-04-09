import { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

type TabsProps = React.ComponentProps<typeof Tabs> & {
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

const meta: Meta<TabsProps> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Valor de la pestaña activa",
    },
    defaultValue: {
      control: "text",
      description: "Valor por defecto de la pestaña activa",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Orientación de las pestañas",
    },
    dir: {
      control: "radio",
      options: ["ltr", "rtl"],
      description: "Dirección del texto",
    },
    className: {
      control: "text",
      description: "Clases CSS personalizadas para Tabs",
    },
    listClassName: {
      control: "text",
      description: "Clases CSS personalizadas para TabsList",
    },
    triggerClassName: {
      control: "text",
      description: "Clases CSS personalizadas para TabsTrigger",
    },
    contentClassName: {
      control: "text",
      description: "Clases CSS personalizadas para TabsContent",
    },
  },
};

export default meta;

type Story = StoryObj<TabsProps>;

export const Default: Story = {
  args: {
    defaultValue: "tab1",
    listClassName: "",
    triggerClassName: "",
    contentClassName: "",
  },
  render: (args) => (
    <Tabs defaultValue={args.defaultValue} className={args.className} orientation={args.orientation} dir={args.dir}>
      <TabsList className={args.listClassName}>
        <TabsTrigger value="tab1" className={args.triggerClassName}>Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className={args.triggerClassName}>Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" className={args.triggerClassName}>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className={args.contentClassName}>Content 1</TabsContent>
      <TabsContent value="tab2" className={args.contentClassName}>Content 2</TabsContent>
      <TabsContent value="tab3" className={args.contentClassName}>Content 3</TabsContent>
    </Tabs>
  ),
};

export const CustomStyle: Story = {
  args: {
    defaultValue: "tab1",
    listClassName: "bg-gray-100 p-2 rounded-md",
    triggerClassName: "bg-white rounded-md m-1",
    contentClassName: "border p-4 rounded-md",
  },
  render: (args) => (
    <Tabs defaultValue={args.defaultValue} className={args.className} orientation={args.orientation} dir={args.dir}>
      <TabsList className={args.listClassName}>
        <TabsTrigger value="tab1" className={args.triggerClassName}>Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className={args.triggerClassName}>Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" className={args.triggerClassName}>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className={args.contentClassName}>Custom Content 1</TabsContent>
      <TabsContent value="tab2" className={args.contentClassName}>Custom Content 2</TabsContent>
      <TabsContent value="tab3" className={args.contentClassName}>Custom Content 3</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: {
    defaultValue: "tab1",
    orientation: "vertical",
    listClassName: "flex-col",
  },
  render: (args) => (
    <Tabs defaultValue={args.defaultValue} className={args.className} orientation={args.orientation} dir={args.dir}>
      <TabsList className={args.listClassName}>
        <TabsTrigger value="tab1" className={args.triggerClassName}>Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className={args.triggerClassName}>Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" className={args.triggerClassName}>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className={args.contentClassName}>Vertical Content 1</TabsContent>
      <TabsContent value="tab2" className={args.contentClassName}>Vertical Content 2</TabsContent>
      <TabsContent value="tab3" className={args.contentClassName}>Vertical Content 3</TabsContent>
    </Tabs>
  ),
};

export const RTL: Story = {
  args: {
    defaultValue: "tab1",
    dir: "rtl",
  },
  render: (args) => (
    <Tabs defaultValue={args.defaultValue} className={args.className} orientation={args.orientation} dir={args.dir}>
      <TabsList className={args.listClassName}>
        <TabsTrigger value="tab1" className={args.triggerClassName}>Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className={args.triggerClassName}>Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" className={args.triggerClassName}>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className={args.contentClassName}>RTL Content 1</TabsContent>
      <TabsContent value="tab2" className={args.contentClassName}>RTL Content 2</TabsContent>
      <TabsContent value="tab3" className={args.contentClassName}>RTL Content 3</TabsContent>
    </Tabs>
  ),
};