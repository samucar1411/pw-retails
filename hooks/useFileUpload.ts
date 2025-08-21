import { useState } from 'react';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No file provided');
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the response status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned invalid response');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
}

export default useFileUpload;