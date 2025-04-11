"use client";

import { Mail, Phone, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContactActions() {
  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon">
        <Mail className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MoreActions() {
  return (
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  );
}
