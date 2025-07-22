'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/ImageUploader';
import { toast } from 'sonner';
import { createSuspect } from '@/services/suspect-service';

// Opciones para los tags
const genderOptions = [
  { label: 'Hombre', value: 'male' },
  { label: 'Mujer', value: 'female' },
  { label: 'Desconocido', value: 'unknown' },
];

const contexturaOptions = [
  { label: 'Flaco', value: 'flaco' },
  { label: 'Normal', value: 'normal' },
  { label: 'Musculoso', value: 'musculoso' },
  { label: 'Sobrepeso', value: 'sobrepeso' },
  { label: 'Desconocido', value: 'desconocido' },
];

const alturaOptions = [
  { label: 'Bajo (<1.60m)', value: 'bajo' },
  { label: 'Normal (1.60m-1.75m)', value: 'normal' },
  { label: 'Alto (1.76m-1.85m)', value: 'alto' },
  { label: 'Muy Alto (>1.85m)', value: 'muy_alto' },
  { label: 'Desconocido', value: 'desconocido' },
];

const pielOptions = [
  { label: 'Clara', value: 'clara' },
  { label: 'Trigueña', value: 'triguena' },
  { label: 'Oscura', value: 'oscura' },
  { label: 'Negra', value: 'negra' },
  { label: 'Desconocido', value: 'desconocido' },
];

const piercingsOptions = [
  { label: 'Nariz', value: 'nariz' },
  { label: 'Oreja', value: 'oreja' },
  { label: 'Cejas', value: 'cejas' },
  { label: 'Lengua', value: 'lengua' },
  { label: 'Labios', value: 'labios' },
  { label: 'Desconocido', value: 'desconocido' },
];

const tatuajesOptions = [
  { label: 'Brazos', value: 'brazos' },
  { label: 'Cara', value: 'cara' },
  { label: 'Cuello', value: 'cuello' },
  { label: 'Piernas', value: 'piernas' },
  { label: 'Mano', value: 'mano' },
  { label: 'Desconocido', value: 'desconocido' },
];

const accesoriosOptions = [
  { label: 'Lentes de sol', value: 'lentes_sol' },
  { label: 'Bolsa', value: 'bolsa' },
  { label: 'Lentes', value: 'lentes' },
  { label: 'Casco', value: 'casco' },
  { label: 'Mochila', value: 'mochila' },
  { label: 'Desconocido', value: 'desconocido' },
];

const comportamientoOptions = [
  { label: 'Nervioso', value: 'nervioso' },
  { label: 'Agresivo', value: 'agresivo' },
  { label: 'Portaba Armas', value: 'portaba_armas' },
  { label: 'Abuso Físico', value: 'abuso_fisico' },
  { label: 'Alcoholizado/Drogado', value: 'alcohol_droga' },
];

const dificultanIdOptions = [
  { label: 'Mascarilla/barbijo', value: 'mascarilla' },
  { label: 'Casco', value: 'casco' },
  { label: 'Pasamontañas', value: 'pasamontanas' },
  { label: 'Capucha', value: 'capucha' },
  { label: 'Lentes Oscuros', value: 'lentes_oscuros' },
];

// Custom square select group
type SquareSelectOption = { label: string; value: string };
interface SquareSelectGroupProps {
  options: SquareSelectOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

function SquareSelectGroup({ options, value, onChange, className = '' }: SquareSelectGroupProps) {
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

interface SuspectFormValues {
  alias: string;
  statusId: number;
  image: string | null;
  description: string;
}

export function SuspectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Record<string, unknown>>({});

  const form = useForm<SuspectFormValues>({
    defaultValues: {
      alias: '',
      statusId: 1,
      image: null,
      description: '',
    },
  });

  // Functions to handle tags
  function getTagValue(key: string): string {
    return (tags[key] as string) || '';
  }

  function setTagValue(key: string, value: unknown) {
    setTags(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function getTagArray(key: string): string[] {
    return Array.isArray(tags[key]) ? tags[key] as string[] : [];
  }

  async function onSubmit(data: SuspectFormValues) {
    setIsSubmitting(true);
    try {
      const suspectData = {
        Alias: data.alias,
        PhysicalDescription: data.description,
        PhotoUrl: data.image || '',
        Tags: Object.values(tags).filter(value => typeof value === 'string') as string[],
        Status: data.statusId,
      };

      const response = await createSuspect(suspectData);
      if (response?.id) {
        toast.success('Sospechoso registrado correctamente');
        router.push('/dashboard/sospechosos');
      } else {
        toast.error('Error al registrar el sospechoso');
      }
    } catch {
      toast.error('Error al registrar el sospechoso');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo (Alias)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre o alias del sospechoso" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del sospechoso</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={value => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Libre</SelectItem>
                    <SelectItem value="2">Detenido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Upload de foto */}
        <div>
          <FormLabel>Fotos del sospechoso</FormLabel>
          <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 flex flex-col items-center justify-center">
            <ImageUploader
              onUploadComplete={url => form.setValue('image', url)}
              maxSizeMB={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <FormLabel>Género</FormLabel>
          <SquareSelectGroup
            options={genderOptions}
            value={getTagValue('gender')}
            onChange={(value) => setTagValue('gender', value)}
          />
        </div>

        {/* Contextura */}
        <div>
          <FormLabel>Contextura</FormLabel>
          <SquareSelectGroup
            options={contexturaOptions}
            value={getTagValue('contextura')}
            onChange={(value) => setTagValue('contextura', value)}
          />
        </div>

        {/* Altura estimada */}
        <div>
          <FormLabel>Altura estimada</FormLabel>
          <SquareSelectGroup
            options={alturaOptions}
            value={getTagValue('altura')}
            onChange={(value) => setTagValue('altura', value)}
          />
        </div>

        {/* Tono de piel */}
        <div>
          <FormLabel>Tono de piel</FormLabel>
          <SquareSelectGroup
            options={pielOptions}
            value={getTagValue('piel')}
            onChange={(value) => setTagValue('piel', value)}
          />
        </div>

        {/* Piercings */}
        <div>
          <FormLabel>Piercings</FormLabel>
          <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
            {piercingsOptions.map(opt => {
              const piercings = getTagArray('piercings');
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`piercings-${opt.value}`}
                    checked={piercings.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newPiercings = checked
                        ? [...piercings, opt.value]
                        : piercings.filter(v => v !== opt.value);
                      setTagValue('piercings', newPiercings);
                    }}
                  />
                  <label htmlFor={`piercings-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {opt.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tatuajes */}
        <div>
          <FormLabel>Tatuajes</FormLabel>
          <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
            {tatuajesOptions.map(opt => {
              const tatuajes = getTagArray('tatuajes');
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tatuajes-${opt.value}`}
                    checked={tatuajes.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newTatuajes = checked
                        ? [...tatuajes, opt.value]
                        : tatuajes.filter(v => v !== opt.value);
                      setTagValue('tatuajes', newTatuajes);
                    }}
                  />
                  <label htmlFor={`tatuajes-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {opt.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Otros accesorios */}
        <div>
          <FormLabel>Otros accesorios</FormLabel>
          <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
            {accesoriosOptions.map(opt => {
              const accesorios = getTagArray('accesorios');
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`accesorios-${opt.value}`}
                    checked={accesorios.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newAccesorios = checked
                        ? [...accesorios, opt.value]
                        : accesorios.filter(v => v !== opt.value);
                      setTagValue('accesorios', newAccesorios);
                    }}
                  />
                  <label htmlFor={`accesorios-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {opt.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comportamiento */}
        <div>
          <FormLabel>Comportamiento</FormLabel>
          <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
            {comportamientoOptions.map(opt => {
              const comportamiento = getTagArray('comportamiento');
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`comportamiento-${opt.value}`}
                    checked={comportamiento.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newComportamiento = checked
                        ? [...comportamiento, opt.value]
                        : comportamiento.filter(v => v !== opt.value);
                      setTagValue('comportamiento', newComportamiento);
                    }}
                  />
                  <label htmlFor={`comportamiento-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {opt.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elementos que dificultan identificación */}
        <div>
          <FormLabel>Elementos que dificultan identificación</FormLabel>
          <div className="grid grid-cols-3 gap-y-2 gap-x-6 mt-2">
            {dificultanIdOptions.map(opt => {
              const dificultanId = getTagArray('dificultan_id');
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dificultan-${opt.value}`}
                    checked={dificultanId.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newDificultanId = checked
                        ? [...dificultanId, opt.value]
                        : dificultanId.filter(v => v !== opt.value);
                      setTagValue('dificultan_id', newDificultanId);
                    }}
                  />
                  <label htmlFor={`dificultan-${opt.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {opt.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observaciones adicionales */}
        <div>
          <FormLabel>Observaciones adicionales</FormLabel>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones relevantes sobre el sospechoso..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Sospechoso'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
