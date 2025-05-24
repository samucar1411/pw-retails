import { NextResponse } from 'next/server';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    await deleteImage(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Error deleting image' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
  });
};
