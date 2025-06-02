'use client';

import React, { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import useImageUpload from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploader({
  onUploadComplete,
  maxSizeMB = 5,
  className = '',
}: ImageUploaderProps) {
  const { uploadImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      onUploadComplete(imageUrl);
      toast.success('Image uploaded successfully');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Max file size: {maxSizeMB}MB
      </p>
    </div>
  );
}

export default ImageUploader;
