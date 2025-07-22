"use client";

import React from 'react';
import { ThemeLogo } from './theme-logo';

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-center py-4 px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ThemeLogo width={200} height={40} className="opacity-90 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
} 