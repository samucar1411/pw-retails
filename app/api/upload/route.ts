import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('file') as File | null; // Changed from 'image' to 'file'

    if (!imageFile) {
      return NextResponse.json({ success: false, message: 'No image file found in form data.' }, { status: 400 });
    }

    // Convert File to buffer to stream to Cloudinary
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<UploadApiResponse | UploadApiErrorResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'incident_photos', // Changed from 'suspect_photos' to 'incident_photos'
          // Cloudinary can often infer resource_type and format.
          // You can specify them if needed, e.g., based on imageFile.type
          // resource_type: 'image',
          // format: imageFile.type.split('/')[1], // e.g., 'png', 'jpeg'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary stream upload error');
            reject(error);
            return;
          }
          if (result) {
            resolve(result);
          } else {
            // This case should ideally not be reached if error is not present
            reject(new Error('Cloudinary upload stream did not return a result or error.'));
          }
        }
      );
      stream.end(buffer);
    });

    // Check if the uploadResult indicates an error (some errors might not throw but return an error object)
    if ('error' in uploadResult && uploadResult.error) {
        console.error('Cloudinary upload failed');
        return NextResponse.json({ success: false, message: `Cloudinary upload error: ${uploadResult.error.message}` }, { status: 500 });
    }
    
    // Ensure secure_url is present in a successful response
    if (!('secure_url' in uploadResult) || !uploadResult.secure_url) {
        console.error('Cloudinary upload result missing secure_url');
        return NextResponse.json({ success: false, message: 'Cloudinary upload did not return a secure URL.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('API Error in upload endpoint');
    let errorMessage = 'Image upload failed due to an unexpected server error.';
    
    // Use the error's message directly if available and more specific
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    
    // Check if it's a Cloudinary-specific error structure
    if (
      error && 
      typeof error === 'object' && 
      'http_code' in error && 
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      const cloudinaryError = error as { http_code: number; message: string };
      errorMessage = `Cloudinary error: ${cloudinaryError.message} (HTTP ${cloudinaryError.http_code})`;
    }
    
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}