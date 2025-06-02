'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Trash2, User, AlertTriangle, UploadCloud } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { createSuspect, getSuspectStatuses } from '@/services/suspect-service';
import { Suspect, SuspectStatus } from '@/types/suspect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

type SuspectFormValues = {
  Alias: string;
  PhysicalDescription: string;
  PhotoUrl: string;
  Status: number;
  image: File | null;
};

type SectionProps = {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const Section = React.memo(({ id, icon: Icon, title, subtitle, children }: SectionProps) => (
  <section id={id} className="space-y-4 rounded-lg border bg-card p-6">
    <div className="flex items-center space-x-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
));

Section.displayName = 'Section';

type IndexButtonProps = {
  id: string;
  icon: React.ElementType;
  label: string;
  activeSection: string;
  onClick: (id: string) => void;
};

const IndexButton = memo(({ id, icon: Icon, label, activeSection, onClick }: IndexButtonProps) => (
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
));

IndexButton.displayName = 'IndexButton';

export function SuspectForm() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<SuspectStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch statuses on mount
  useEffect(() => {
    getSuspectStatuses()
      .then(setStatuses)
      .catch(error => {
        console.error('Error fetching statuses:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estados',
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingStatuses(false));
  }, []);

  const statusOptions = statuses.map(s => ({
    value: s.id.toString(),
    label: s.Name
  }));

  const form = useForm<SuspectFormValues>({
    defaultValues: {
      Alias: '',
      PhysicalDescription: '',
      PhotoUrl: '',
      Status: 1,
      image: null,
    },
  });

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato de archivo no válido',
        description: 'Por favor, sube una imagen válida (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo demasiado grande',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    form.setValue('image', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [form]);

  const removeImage = useCallback(() => {
    form.setValue('image', null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form]);

  const onSubmit = useCallback(async (values: SuspectFormValues) => {
    setLoading(true);
    let finalPhotoUrl = values.PhotoUrl;

    try {
      // 1. Upload image if a new file is provided
      if (values.image) {
        const formData = new FormData();
        formData.append('image', values.image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          console.error('Image upload failed:', uploadResult.message);
          toast({
            title: 'Error de Subida',
            description: `No se pudo subir la imagen: ${uploadResult.message || 'Error desconocido'}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        finalPhotoUrl = uploadResult.url;
      }

      // 2. Prepare suspect data for creation
      const suspectDataToCreate: Partial<Suspect> = {
        Alias: values.Alias,
        PhysicalDescription: values.PhysicalDescription,
        Status: Number(values.Status),
        PhotoUrl: finalPhotoUrl,
      };

      // 3. Create the suspect
      const newSuspect = await createSuspect(suspectDataToCreate);

      if (newSuspect) {
        toast({
          title: 'Éxito',
          description: 'Sospechoso creado exitosamente.',
        });
        router.push('/dashboard/sospechosos');
      } else {
        throw new Error('La creación del sospechoso no devolvió un resultado exitoso.');
      }
    } catch (error) {
      console.error('Error submitting suspect form:', error);
      toast({
        title: 'Error',
        description: `No se pudo crear el sospechoso: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen p-4 md:p-6">
      {/* Main content */}
      <div className="flex-1 pr-4 md:pr-6 pb-24">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Registrar Sospechoso</h1>
            <p className="text-sm text-muted-foreground">Información detallada del sospechoso</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Section id="details" icon={User} title="Información Personal" subtitle="Datos básicos del sospechoso">
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

              <FormField
                control={form.control}
                name="PhysicalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Física</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descripción física del sospechoso"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Fotografía</FormLabel>
                  <div className="flex items-center gap-4">
                    {previewImage ? (
                      <div className="relative">
                        <Image
                          src={previewImage}
                          alt="Vista previa de la foto"
                          width={100}
                          height={100}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={removeImage}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Subir foto
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        JPG, PNG o WEBP (máx. 5MB)
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </FormItem>
              </div>
            </Section>

            <div className="flex justify-end gap-4 pt-4">
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
                  'Guardar sospechoso'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Sidebar navigation */}
      <div className="w-[220px] hidden md:block sticky top-4 self-start p-4 border-l h-[calc(100vh-2rem)] overflow-y-auto">
        <nav className="space-y-2">
          <IndexButton 
            id="details" 
            icon={User} 
            label="Información" 
            activeSection={activeSection} 
            onClick={scrollToSection} 
          />
          <IndexButton 
            id="photo"   
            icon={AlertTriangle} 
            label="Fotografía"   
            activeSection={activeSection} 
            onClick={scrollToSection} 
          />
        </nav>
      </div>
    </div>
  );
}

export default SuspectForm;
