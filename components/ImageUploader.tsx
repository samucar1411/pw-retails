'use client';

import { ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, UploadCloud } from 'lucide-react';

export interface ImageUploaderProps {
  onImageUpload?: (file: File) => Promise<void>;
  onUploadComplete?: (url: string) => void;
  currentImage?: string | null;
  isUploading?: boolean;
  className?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploader({
  onImageUpload,
  onUploadComplete,
  currentImage,
  isUploading,
  className = 'w-24 h-24',
  maxSizeMB = 5,
  disabled = false,
  multiple = false,
  maxFiles = 1,
}: ImageUploaderProps) {
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Verificar límite de archivos
      if (fileArray.length > maxFiles) {
        alert(`Puede subir máximo ${maxFiles} imagen${maxFiles > 1 ? 'es' : ''}`);
        return;
      }

      for (const file of fileArray) {
        // Verificar que sea una imagen
        if (!file.type.startsWith('image/')) {
          alert(`El archivo ${file.name} no es una imagen válida`);
          return;
        }
        
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`La imagen ${file.name} es demasiado grande. El tamaño máximo es ${maxSizeMB}MB`);
          return;
        }
        
        try {
          if (onImageUpload) {
            await onImageUpload(file);
          }
          // Si la carga fue exitosa y tenemos onUploadComplete, llamarlo
          if (onUploadComplete) {
            onUploadComplete(URL.createObjectURL(file));
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
  };

  // Si hay una imagen actual, mostrar el avatar
  if (currentImage) {
    return (
      <div className="flex items-center gap-4">
        <Avatar className={className}>
          <AvatarImage src={currentImage} />
          <AvatarFallback>
            <Camera className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
            disabled={isUploading || disabled}
            multiple={multiple}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isUploading || disabled}
            >
              <span>
                {isUploading ? 'Subiendo...' : 'Cambiar foto'}
              </span>
            </Button>
          </label>
        </div>
      </div>
    );
  }

  // Si no hay imagen, mostrar el área de upload
  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="image-upload"
        disabled={isUploading || disabled}
        multiple={multiple}
      />
      <label 
        htmlFor="image-upload"
        className={`
          block w-full p-6 border-2 border-dashed border-border rounded-lg
          bg-muted/10 cursor-pointer transition-colors
          hover:border-primary/50 hover:bg-muted/20
          ${isUploading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-12 h-12 text-primary mb-4" />
          <p className="text-lg font-medium mb-2">
            {isUploading ? 'Subiendo imágenes...' : 'Subir imágenes'}
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG o JPEG (máx. {maxFiles} imagen{maxFiles > 1 ? 'es' : ''})
          </p>
        </div>
      </label>
    </div>
  );
}
