'use client';

'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SuspectFormValues = {
  Alias: string;
  PhysicalDescription: string;
  PhotoUrl: string;
  Status: number;
  image: File | null;
};

export function SuspectForm() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<SuspectStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch statuses when component mounts
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getSuspectStatuses();
        setStatuses(statuses);
      } catch (error) {
        console.error('Error fetching statuses:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estados del sospechoso',
          variant: 'destructive',
        });
      } finally {
        setLoadingStatuses(false);
      }
    };
    
    fetchStatuses();
  }, []);
  
  // Map statuses to the format expected by the select component
  const statusOptions = statuses.map(status => ({
    value: status.id.toString(),
    label: status.Name
  }));

  const form = useForm<SuspectFormValues>({
    defaultValues: {
      Alias: '',
      PhysicalDescription: '',
      PhotoUrl: '',
      Status: 1, // Default status
      image: null,
    },
  });

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato no válido',
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
  };

  const removeImage = () => {
    form.setValue('image', null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (values: SuspectFormValues) => {
    setLoading(true);
    try {
      let photoUrl = values.PhotoUrl;
      
      // Upload image if a new file is provided
      if (values.image) {
        const formData = new FormData();
        formData.append('file', values.image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const { url } = await uploadResponse.json();
        photoUrl = url;
      }
      
      // Create suspect with the uploaded photo URL
      const suspectData: Partial<Suspect> = {
        Alias: values.Alias,
        PhysicalDescription: values.PhysicalDescription,
        PhotoUrl: photoUrl,
        Status: values.Status,
      };
      
      const response = await createSuspect(suspectData);
      
      if (response) {
        toast({
          title: 'Sospechoso registrado',
          description: 'La información del sospechoso se ha guardado correctamente.',
        });
        router.push('/dashboard/sospechosos');
      }
    } catch (error) {
      console.error('Error al registrar el sospechoso:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el sospechoso. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ id, icon: Icon, title, subtitle, children }: {
    id: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => (
    <section id={id} className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex gap-3 items-center mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );

  const IndexButton = ({ id, icon: Icon, label }: { id: string; icon: React.ElementType; label: string }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        activeSection === id && "bg-muted"
      )}
      onClick={() => scrollToSection(id)}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="flex min-h-screen p-4 md:p-6">
      <div className="flex-1 pr-4 md:pr-6 pb-24">
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
                        <Input placeholder="Alias o apodo" {...field} />
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
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                        defaultValue={field.value?.toString()}
                        disabled={loadingStatuses}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                              placeholder={loadingStatuses ? 'Cargando estados...' : 'Seleccionar estado'} 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingStatuses ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Cargando...
                            </div>
                          ) : (
                            statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))
                          )}
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
                        placeholder="Describa las características físicas del sospechoso..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>


            <Section id="photo" icon={AlertTriangle} title="Fotografía" subtitle="Imagen del sospechoso">
              <div className="space-y-4">
                {previewImage ? (
                  <div className="flex flex-col items-start gap-4">
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Vista previa"
                        className="h-48 w-48 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar imagen
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <p className="mb-1 text-sm">
                          <span className="font-semibold">Click para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs">JPG, PNG (Máx 5MB)</p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </Section>


          </form>
        </Form>
      </div>

      <div className="w-[220px] hidden md:block sticky top-4 self-start p-4 border-l h-[calc(100vh-2rem)] overflow-y-auto">
        <nav className="space-y-2">
          <IndexButton id="details" icon={User} label="Información" />
          <IndexButton id="photo" icon={AlertTriangle} label="Fotografía" />
        </nav>
      </div>

      <div className="fixed bottom-0 left-0 md:left-auto right-0 w-full md:w-[calc(100%-220px)] border-t bg-background/80 backdrop-blur-sm p-4 z-50">
        <div className="flex justify-end gap-3 max-w-6xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Sospechoso'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SuspectForm;
