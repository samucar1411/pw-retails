import { Meta, StoryObj } from "@storybook/react"
import { ScrollArea, ScrollBar } from "./scroll-area"

const meta: Meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: { control: "text" },
    itemText: { control: "text", defaultValue: "Item" },
    startNumber: { control: "number", defaultValue: 1 },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// **Default ScrollArea**: ScrollArea con desplazamiento vertical
export const Default: Story = {
  args: {
    className: "border rounded-md",
    itemText: "Item",
    startNumber: 1,
  },
  render: ({ className, itemText, startNumber }) => (
    <ScrollArea className={className}>
      <div className="p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i}>{itemText} {startNumber + i}</p>
        ))}
      </div>
    </ScrollArea>
  ),
}

// **Horizontal Scroll**: ScrollArea con desplazamiento horizontal
export const HorizontalScroll: Story = {
  args: {
    className: "border rounded-md",
    itemText: "Item",
    startNumber: 1,
  },
  render: ({ className, itemText, startNumber }) => (
    <ScrollArea className={className}>
      <div className="flex p-4 whitespace-nowrap">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="w-48 border m-2 p-4">
            {itemText} {startNumber + i}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

// **Custom ScrollBar**: ScrollArea con ScrollBar personalizado
export const CustomStyle: Story = {
  args: {
    className: "border rounded-lg bg-gray-100",
    itemText: "Item",
    startNumber: 1,
  },
  render: ({ className, itemText, startNumber }) => (
    <ScrollArea className={className}>
      <div className="p-6">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="mb-2">
            {itemText} {startNumber + i}
          </div>
        ))}
      </div>
      <ScrollBar className="bg-gray-200" />
    </ScrollArea>
  ),
}

// **Both Scrolls**: ScrollArea con desplazamiento tanto vertical como horizontal
export const BothScrolls: Story = {
  args: {
    className: "border rounded-md",
    itemText: "Item",
    startNumber: 1,
  },
  render: ({ className, itemText, startNumber }) => (
    <ScrollArea className={className}>
      <div className="p-4">
        <div className="flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="w-48">
              {Array.from({ length: 10 }, (_, j) => (
                <p key={j}>{itemText} {startNumber + i}-{j + 1}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar className="bg-gray-300" />
    </ScrollArea>
  ),
}
