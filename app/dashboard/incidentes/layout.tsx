'use client'

import React from 'react'
import { Toaster } from '@/components/ui/toaster'

export default function IncidentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      {children}
      <Toaster />
    </div>
  )
} 