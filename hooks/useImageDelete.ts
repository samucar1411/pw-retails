import { useState } from 'react';

export function useImageDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteImage, isDeleting, error };
}

export default useImageDelete;
