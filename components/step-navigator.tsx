'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Step = {
  id: string;
  label: string;
};

interface StepNavigatorProps {
  steps: Step[];
  className?: string;
}

export function StepNavigator({ steps, className }: StepNavigatorProps) {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id || '');

  // Configurar el IntersectionObserver para monitorear las secciones visibles
  useEffect(() => {
    const sections = steps.map(step => document.getElementById(step.id)).filter(Boolean);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveStepId(entry.target.id);
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => {
      if (section) observer.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, [steps]);

  // Función para desplazarse a la sección al hacer clic
  const handleStepClick = (stepId: string) => {
    const section = document.getElementById(stepId);
    if (section) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      section.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className={cn("lg:block hidden", className)}>
      <ul className="space-y-2 text-sm">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => handleStepClick(step.id)}
              className={cn(
                "flex items-center transition-colors hover:text-primary px-3 py-2 rounded-md w-full text-left",
                activeStepId === step.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:bg-muted/10"
              )}
            >
              <span className={cn(
                "relative pl-5",
                activeStepId === step.id && "before:content-['●'] before:absolute before:left-0 before:text-[10px] before:text-primary"
              )}>
                {step.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 