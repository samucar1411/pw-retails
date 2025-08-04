'use client';

import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

// Opciones para los tags
export const SUSPECT_TAG_OPTIONS = {
  'gender': [
    { label: 'Hombre', value: 'male' },
    { label: 'Mujer', value: 'female' },
    { label: 'Desconocido', value: 'unknown' },
  ],
  'contextura': [
    { label: 'Flaco', value: 'flaco' },
    { label: 'Normal', value: 'normal' },
    { label: 'Musculoso', value: 'musculoso' },
    { label: 'Sobrepeso', value: 'sobrepeso' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'altura': [
    { label: 'Bajo (<1.60m)', value: 'bajo' },
    { label: 'Normal (1.60m-1.75m)', value: 'normal' },
    { label: 'Alto (1.76m-1.85m)', value: 'alto' },
    { label: 'Muy Alto (>1.85m)', value: 'muy_alto' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'piel': [
    { label: 'Clara', value: 'clara' },
    { label: 'Trigueña', value: 'triguena' },
    { label: 'Oscura', value: 'oscura' },
    { label: 'Negra', value: 'negra' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'piercings': [
    { label: 'Nariz', value: 'nariz' },
    { label: 'Oreja', value: 'oreja' },
    { label: 'Cejas', value: 'cejas' },
    { label: 'Lengua', value: 'lengua' },
    { label: 'Labios', value: 'labios' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'tatuajes': [
    { label: 'Brazos', value: 'brazos' },
    { label: 'Cara', value: 'cara' },
    { label: 'Cuello', value: 'cuello' },
    { label: 'Piernas', value: 'piernas' },
    { label: 'Mano', value: 'mano' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'accesorios': [
    { label: 'Lentes de sol', value: 'lentes_sol' },
    { label: 'Bolsa', value: 'bolsa' },
    { label: 'Lentes', value: 'lentes' },
    { label: 'Casco', value: 'casco' },
    { label: 'Mochila', value: 'mochila' },
    { label: 'Desconocido', value: 'desconocido' },
  ],
  'comportamiento': [
    { label: 'Nervioso', value: 'nervioso' },
    { label: 'Agresivo', value: 'agresivo' },
    { label: 'Portaba Armas', value: 'portaba_armas' },
    { label: 'Abuso Físico', value: 'abuso_fisico' },
    { label: 'Alcoholizado/Drogado', value: 'alcohol_droga' },
  ],
  'dificultan_id': [
    { label: 'Mascarilla/barbijo', value: 'mascarilla' },
    { label: 'Casco', value: 'casco' },
    { label: 'Pasamontañas', value: 'pasamontanas' },
    { label: 'Capucha', value: 'capucha' },
    { label: 'Lentes Oscuros', value: 'lentes_oscuros' },
  ],
};

// Square Select Group Component
type SquareSelectOption = { label: string; value: string };
interface SquareSelectGroupProps {
  options: SquareSelectOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function SquareSelectGroup({ options, value, onChange, className = '' }: SquareSelectGroupProps) {
  return (
    <div className={`flex flex-row gap-[10px] overflow-x-auto pb-2 mt-2 ${className}`}>
      {options.map((opt: SquareSelectOption, idx: number) => {
        const selected = String(value) === String(opt.value);
        return (
          <button
            key={`${opt.value}-${idx}`}
            type="button"
            onClick={() => onChange(String(opt.value))}
            className={
              'min-w-[100px] w-[100px] h-[100px] rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-colors outline-none ' +
              (selected
                ? 'bg-primary/40 border-2 border-primary text-primary-foreground'
                : 'bg-background border border-border text-foreground hover:border-primary hover:bg-muted/50')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Checkbox Group Component
interface CheckboxGroupProps {
  options: SquareSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  label: string;
  className?: string;
}

export function CheckboxGroup({ options, value, onChange, label, className = '' }: CheckboxGroupProps) {
  return (
    <div className={className}>
      <FormLabel>{label}</FormLabel>
      <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
        {options.map(opt => (
          <div key={opt.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${label.toLowerCase()}-${opt.value}`}
              checked={value.includes(opt.value)}
              onCheckedChange={(checked) => {
                const newValues = checked
                  ? [...value, opt.value]
                  : value.filter(v => v !== opt.value);
                onChange(newValues);
              }}
            />
            <label 
              htmlFor={`${label.toLowerCase()}-${opt.value}`} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Single Select with Square Buttons
interface SingleSelectProps {
  options: SquareSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function SingleSelect({ options, value, onChange, label, className = '' }: SingleSelectProps) {
  return (
    <div className={className}>
      <FormLabel>{label}</FormLabel>
      <SquareSelectGroup
        options={options}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}