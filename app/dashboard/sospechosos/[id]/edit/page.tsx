'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSuspectById, updateSuspect, getSuspectStatuses } from '@/services/suspect-service';
import { Suspect, SuspectStatus } from '@/types/suspect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

// Opciones para los tags (same as create form)
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

const suspectFormSchema = z.object({
  Alias: z.string().min(1, 'El alias es requerido'),
  PhysicalDescription: z.string().min(1, 'La descripción física es requerida'),
  PhotoUrl: z.string().min(1, 'La foto es requerida'),
  Status: z.number(),
});

type SuspectFormValues = z.infer<typeof suspectFormSchema>;

interface ApiError {
  data: {
    [key: string]: string[];
  };
}

export default function EditSuspectPage() {
  const router = useRouter();
  const params = useParams();
  const [statuses, setStatuses] = useState<SuspectStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState<Record<string, string>>({});

  const form = useForm<SuspectFormValues>({
    resolver: zodResolver(suspectFormSchema),
    defaultValues: {
      Alias: '',
      PhysicalDescription: '',
      PhotoUrl: '',
      Status: 1,
    },
  });

  // Fetch suspect and statuses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suspectData, statusesData] = await Promise.all([
          getSuspectById(params.id as string),
          getSuspectStatuses()
        ]);

        if (suspectData) {
          form.reset({
            Alias: suspectData.Alias || '',
            PhysicalDescription: suspectData.PhysicalDescription || '',
            PhotoUrl: suspectData.PhotoUrl || '',
            Status: suspectData.Status || 1,
          });
          setTags(suspectData.Tags as Record<string, string> || {});
        }

        setStatuses(statusesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoadingStatuses(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, form]);

  const statusOptions = statuses.map(s => ({
    value: s.id.toString(),
    label: s.Name
  }));

  // Functions to handle tags
  function getTagValue(key: string): string {
    return (tags[key] as string) || '';
  }

  function setTagValue(key: string, value: string) {
    setTags(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function getTagArray(key: string): string[] {
    return Array.isArray(tags[key]) ? tags[key] as string[] : [];
  }

  const onSubmit = useCallback(async (values: SuspectFormValues) => {
    setLoading(true);

    try {
      // Prepare suspect data for update
      const suspectDataToUpdate: Partial<Suspect> = {
        Alias: values.Alias,
        PhysicalDescription: values.PhysicalDescription,
        Status: Number(values.Status),
        PhotoUrl: values.PhotoUrl,
        Tags: tags as Record<string, string>,
      };

      // Update the suspect
      const updatedSuspect = await updateSuspect(params.id as string, suspectDataToUpdate);

      if (updatedSuspect?.id) {
        toast({
          title: 'Éxito',
          description: 'Sospechoso actualizado exitosamente.',
        });
        router.push(`/dashboard/sospechosos/${params.id}`);
      } else {
        throw new Error('La actualización del sospechoso no devolvió un resultado exitoso.');
      }
    } catch (error) {
      console.error('Error updating suspect:', error);
      
      // Handle backend validation errors
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data) {
        const backendErrors = axiosError.response.data;
        Object.entries(backendErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            form.setError(field as keyof SuspectFormValues, {
              type: 'manual',
              message: errors[0]
            });
          }
        });
      }

      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos requeridos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router, tags, form, params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/sospechosos/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Editar Sospechoso</h1>
            <p className="text-sm text-muted-foreground">ID: {params.id}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Alias del sospechoso" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={value => field.onChange(parseInt(value, 10))}
                        value={field.value?.toString()}
                        disabled={loadingStatuses}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingStatuses ? 'Cargando...' : 'Seleccionar estado'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
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
                    onImageUpload={async (file) => {
                      // Por ahora solo simularemos la carga
                      const url = URL.createObjectURL(file);
                      form.setValue('PhotoUrl', url);
                    }}
                    onUploadComplete={url => form.setValue('PhotoUrl', url)}
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
                            setTagValue('piercings', newPiercings.join(', '));
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
                            setTagValue('tatuajes', newTatuajes.join(', '));
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
                            setTagValue('accesorios', newAccesorios.join(', '));
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
                            setTagValue('comportamiento', newComportamiento.join(', '));
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
                            setTagValue('dificultan_id', newDificultanId.join(', '));
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
              <FormField
                control={form.control}
                name="PhysicalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Observaciones relevantes sobre el sospechoso..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 