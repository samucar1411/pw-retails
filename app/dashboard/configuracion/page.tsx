'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/ImageUploader';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useProfile } from '@/hooks/use-profile';
import { User, Settings } from 'lucide-react';
import { useEffect } from 'react';

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  last_name: z.string().min(2, {
    message: 'El apellido debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Ingrese un correo electrónico válido.',
  }),
  phone: z.string().min(6, {
    message: 'Ingrese un número de teléfono válido.',
  }).optional(),
  position: z.string().min(2, {
    message: 'El cargo debe tener al menos 2 caracteres.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { uploadImage, isUploading } = useImageUpload();
  const { profile, isLoadingProfile, updateProfile, isUpdating, error } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        position: profile.position || '',
      });
    }
  }, [profile, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile({
        ...data,
        profileImage: profile?.profileImage,
      });
      
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados exitosamente.',
      });
    } catch {
      toast({
        title: 'Error',
        description: error || 'No se pudieron guardar los cambios. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      await updateProfile({
        ...form.getValues(),
        profileImage: imageUrl,
      });
      
      toast({
        title: 'Imagen actualizada',
        description: 'La imagen de perfil se ha actualizado correctamente.',
      });
    } catch {
      toast({
        title: 'Error',
        description: error || 'No se pudo actualizar la imagen. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Actualice su información personal y de contacto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Foto de Perfil
              </label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                currentImage={profile?.profileImage}
                isUploading={isUploading}
                className="w-32 h-32"
              />
            </div>

            <Separator className="my-6" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su número de teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su cargo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 