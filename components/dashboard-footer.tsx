"use client";

import React from 'react';
import { ThemeLogo } from './theme-logo';

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-center py-3 px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ThemeLogo width={250} height={50} className="opacity-80" />
        </div>
      </div>
    </footer>
  );
} 