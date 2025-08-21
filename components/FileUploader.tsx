'use client';

import { ChangeEvent } from 'react';
import { UploadCloud, File } from 'lucide-react';

export interface FileUploaderProps {
  onFileUpload?: (file: File) => Promise<void>;
  onUploadComplete?: (url: string) => void;
  isUploading?: boolean;
  className?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: 'images' | 'documents' | 'all';
}

export function FileUploader({
  onFileUpload,
  onUploadComplete,
  isUploading,
  className = '',
  maxSizeMB = 10,
  disabled = false,
  multiple = false,
  maxFiles = 5,
  acceptedTypes = 'all',
}: FileUploaderProps) {
  
  const getAcceptAttribute = () => {
    switch (acceptedTypes) {
      case 'images':
        return 'image/*';
      case 'documents':
        return '.pdf,.doc,.docx,.txt,.rtf,.odt';
      case 'all':
      default:
        return 'image/*,.pdf,.doc,.docx,.txt,.rtf,.odt';
    }
  };


  const isValidFileType = (file: File): boolean => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text'
    ];

    switch (acceptedTypes) {
      case 'images':
        return imageTypes.includes(file.type);
      case 'documents':
        return documentTypes.includes(file.type);
      case 'all':
      default:
        return [...imageTypes, ...documentTypes].includes(file.type);
    }
  };

  const getFileTypeDescription = () => {
    switch (acceptedTypes) {
      case 'images':
        return 'PNG, JPG, GIF, WebP';
      case 'documents':
        return 'PDF, DOC, DOCX, TXT, RTF';
      case 'all':
      default:
        return 'Imágenes y documentos';
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Verificar límite de archivos
      if (fileArray.length > maxFiles) {
        alert(`Puede subir máximo ${maxFiles} archivo${maxFiles > 1 ? 's' : ''}`);
        return;
      }

      for (const file of fileArray) {
        // Verificar tipo de archivo
        if (!isValidFileType(file)) {
          alert(`El archivo ${file.name} no es un tipo válido. Tipos aceptados: ${getFileTypeDescription()}`);
          return;
        }
        
        // Verificar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo es ${maxSizeMB}MB`);
          return;
        }
        
        try {
          if (onFileUpload) {
            await onFileUpload(file);
          }
          // Si la carga fue exitosa y tenemos onUploadComplete, llamarlo
          if (onUploadComplete) {
            onUploadComplete(URL.createObjectURL(file));
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert(`Error al subir el archivo ${file.name}`);
        }
      }
    }
    
    // Limpiar el input para permitir subir el mismo archivo nuevamente
    event.target.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        accept={getAcceptAttribute()}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={isUploading || disabled}
        multiple={multiple}
      />
      <label 
        htmlFor="file-upload"
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
            {isUploading ? 'Subiendo archivos...' : 'Subir archivos'}
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            {getFileTypeDescription()} (máx. {maxFiles} archivo{maxFiles > 1 ? 's' : ''})
          </p>
          <p className="text-xs text-muted-foreground">
            Tamaño máximo: {maxSizeMB}MB por archivo
          </p>
        </div>
      </label>
    </div>
  );
}