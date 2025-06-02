'use client';

import { useState } from 'react';
import { IncidentForm } from '@/components/incident-form';
import { Button } from '@/components/ui/button';
import { Info, DollarSign, Users, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewIncidentPage() {
  const [activeSection, setActiveSection] = useState('details');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    // Send the scroll command to the IncidentForm
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const sections = [
    { id: 'details', icon: Info, label: 'Detalles' },
    { id: 'losses', icon: DollarSign, label: 'Pérdidas' },
    { id: 'suspects', icon: Users, label: 'Sospechosos' },
    { id: 'attachments', icon: Paperclip, label: 'Adjuntos' },
  ];

  const IndexButton = ({ id, icon: Icon, label, activeSection, onClick }: {
    id: string;
    icon: React.ElementType;
    label: string;
    activeSection: string;
    onClick: (id: string) => void;
  }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        activeSection === id && "bg-muted"
      )}
      onClick={() => onClick(id)}
      type="button"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="flex min-h-screen p-4 md:p-6">
      {/* Main content */}
      <div className="flex-1 pr-4 md:pr-6 pb-24">
        <IncidentForm />
      </div>

      {/* Sidebar navigation */}
      <div className="w-[220px] hidden md:block sticky top-4 self-start p-4 border-l h-[calc(100vh-2rem)] overflow-y-auto">
        <nav className="space-y-2">
          {sections.map((section) => (
            <IndexButton 
              key={section.id}
              id={section.id} 
              icon={section.icon} 
              label={section.label} 
              activeSection={activeSection} 
              onClick={scrollToSection} 
            />
          ))}
        </nav>
      </div>
    </div>
  );
} 