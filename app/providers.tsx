'use client'

import React from 'react'
import { SuspectProvider } from '@/context/suspect-context'
import { IncidentProvider } from '@/context/incident-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SuspectProvider>
      <IncidentProvider>
        {children}
      </IncidentProvider>
    </SuspectProvider>
  )
} 