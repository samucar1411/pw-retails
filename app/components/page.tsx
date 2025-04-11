"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ComponentsShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Theme Toggle Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Theme</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              Toggle between light and dark mode
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Buttons</h2>

        <div className="space-y-8">
          {/* Button Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Button States */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
              <Button isLoading>Loading</Button>
            </div>
          </div>

          {/* Button Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Colors</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary</Button>
              <Button className="bg-accent hover:bg-accent/90">Accent</Button>
              <Button className="bg-info hover:bg-info/90">Info</Button>
              <Button className="bg-warning hover:bg-warning/90">
                Warning
              </Button>
              <Button className="bg-success hover:bg-success/90">
                Success
              </Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Button with Icons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">With Icons</h3>
            <div className="flex flex-wrap gap-4">
              <Button>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
              <Button variant="secondary">
                <Lock className="mr-2 h-4 w-4" /> Lock
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Inputs</h2>

        <div className="space-y-8 max-w-md">
          {/* Basic Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Basic</h3>
            <div className="space-y-4">
              <Input placeholder="Default input" />
              <Input disabled placeholder="Disabled input" />
              <Input placeholder="With label" label="Email" />
            </div>
          </div>

          {/* Input Sizes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Sizes</h3>
            <div className="space-y-4">
              <Input className="h-8 text-sm" placeholder="Small" />
              <Input placeholder="Default" />
              <Input className="h-12" placeholder="Large" />
            </div>
          </div>

          {/* Input States */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">States</h3>
            <div className="space-y-4">
              <Input placeholder="Default" />
              <Input placeholder="Disabled" disabled />
              <Input placeholder="With error" error="This field is required" />
              <Input placeholder="With success" success="Looks good!" />
            </div>
          </div>

          {/* Input with Icons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">With Icons</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search..." />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Email address" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  type="password"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
