import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await uploadImage(buffer);

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
  });
};
