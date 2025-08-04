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
import { ArrowLeft, Loader2, User, Camera, Tags, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSuspectById, updateSuspect, getSuspectStatuses } from '@/services/suspect-service';
import { Suspect, SuspectStatus } from '@/types/suspect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  SUSPECT_TAG_OPTIONS,
  SquareSelectGroup,
  CheckboxGroup,
  SingleSelect 
} from '@/components/suspect-form/tag-selector';
import Link from 'next/link';


const suspectFormSchema = z.object({
  Alias: z.string().min(1, 'El alias es requerido'),
  Name: z.string().optional(),
  LastName: z.string().optional(),
  LastName2: z.string().optional(),
  PhysicalDescription: z.string().min(1, 'La descripción física es requerida'),
  PhotoUrl: z.string().min(1, 'La foto es requerida'),
  Status: z.number(),
  Nationality: z.string().optional(),
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
      Name: '',
      LastName: '',
      LastName2: '',
      PhysicalDescription: '',
      PhotoUrl: '',
      Status: 1,
      Nationality: '',
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
            Name: suspectData.Name || '',
            LastName: suspectData.LastName || '',
            LastName2: suspectData.LastName2 || '',
            PhysicalDescription: suspectData.PhysicalDescription || '',
            PhotoUrl: suspectData.PhotoUrl || '',
            Status: suspectData.Status || 1,
            Nationality: suspectData.Nationality || '',
          });
          
          // Handle tags properly - convert to the expected format
          const suspectTags = suspectData.Tags || {};
          console.log('Loading suspect tags:', suspectTags);
          setTags(suspectTags as Record<string, string>);
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
    const value = tags[key];
    if (typeof value === 'string') {
      return value;
    }
    return '';
  }

  function setTagValue(key: string, value: string) {
    console.log('Setting tag:', key, 'to:', value);
    setTags(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function getTagArray(key: string): string[] {
    const value = tags[key];
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string' && value) {
      return value.split(', ').filter(v => v.trim() !== '');
    }
    return [];
  }

  const onSubmit = useCallback(async (values: SuspectFormValues) => {
    setLoading(true);

    try {
      console.log('Current tags state before submit:', tags);
      
      // Prepare suspect data for update
      const suspectDataToUpdate: Partial<Suspect> = {
        Alias: values.Alias,
        Name: values.Name || null,
        LastName: values.LastName || null,
        LastName2: values.LastName2 || null,
        PhysicalDescription: values.PhysicalDescription,
        Status: Number(values.Status),
        PhotoUrl: values.PhotoUrl,
        Nationality: values.Nationality || null,
        Tags: tags as Record<string, string>,
      };
      
      console.log('Suspect data to update:', suspectDataToUpdate);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/sospechosos">Sospechosos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/sospechosos/${params.id}`}>
                {form.watch('Alias') || 'Detalle de sospechoso'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Información Personal</h3>
                  <p className="text-sm text-muted-foreground">Datos básicos del sospechoso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias *</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre del sospechoso" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Primer apellido" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LastName2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Apellido</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Segundo apellido" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="Nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nacionalidad del sospechoso" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Photo Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Fotografía</h3>
                  <p className="text-sm text-muted-foreground">Imagen del sospechoso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Current image display */}
              {form.watch('PhotoUrl') && (
                <div className="mb-4">
                  <FormLabel>Imagen actual</FormLabel>
                  <div className="mt-2 flex justify-center">
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                      <img
                        src={form.watch('PhotoUrl')}
                        alt="Imagen actual del sospechoso"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <FormLabel>Actualizar imagen</FormLabel>
              <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 flex flex-col items-center justify-center mt-2">
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
            </CardContent>
          </Card>

          {/* Physical Characteristics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Tags className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Características Físicas</h3>
                  <p className="text-sm text-muted-foreground">Descripción detallada del sospechoso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SingleSelect
                label="Género"
                options={SUSPECT_TAG_OPTIONS.gender}
                value={getTagValue('gender')}
                onChange={(value) => setTagValue('gender', value)}
              />

              <SingleSelect
                label="Contextura"
                options={SUSPECT_TAG_OPTIONS.contextura}
                value={getTagValue('contextura')}
                onChange={(value) => setTagValue('contextura', value)}
              />

              <SingleSelect
                label="Altura estimada"
                options={SUSPECT_TAG_OPTIONS.altura}
                value={getTagValue('altura')}
                onChange={(value) => setTagValue('altura', value)}
              />

              <SingleSelect
                label="Tono de piel"
                options={SUSPECT_TAG_OPTIONS.piel}
                value={getTagValue('piel')}
                onChange={(value) => setTagValue('piel', value)}
              />

              <CheckboxGroup
                label="Piercings"
                options={SUSPECT_TAG_OPTIONS.piercings}
                value={getTagArray('piercings')}
                onChange={(values) => setTagValue('piercings', values.join(', '))}
              />

              <CheckboxGroup
                label="Tatuajes"
                options={SUSPECT_TAG_OPTIONS.tatuajes}
                value={getTagArray('tatuajes')}
                onChange={(values) => setTagValue('tatuajes', values.join(', '))}
              />

              <CheckboxGroup
                label="Otros accesorios"
                options={SUSPECT_TAG_OPTIONS.accesorios}
                value={getTagArray('accesorios')}
                onChange={(values) => setTagValue('accesorios', values.join(', '))}
              />
            </CardContent>
          </Card>

          {/* Behavioral Characteristics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Comportamiento y Elementos Distintivos</h3>
                  <p className="text-sm text-muted-foreground">Comportamiento observado y elementos que dificultan identificación</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CheckboxGroup
                label="Comportamiento"
                options={SUSPECT_TAG_OPTIONS.comportamiento}
                value={getTagArray('comportamiento')}
                onChange={(values) => setTagValue('comportamiento', values.join(', '))}
              />

              <CheckboxGroup
                label="Elementos que dificultan identificación"
                options={SUSPECT_TAG_OPTIONS.dificultan_id}
                value={getTagArray('dificultan_id')}
                onChange={(values) => setTagValue('dificultan_id', values.join(', '))}
              />
            </CardContent>
          </Card>

          {/* Additional Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Observaciones Adicionales</h3>
                  <p className="text-sm text-muted-foreground">Información complementaria sobre el sospechoso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
    </div>
  );
} 