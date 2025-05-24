import { v2 as cloudinary } from 'cloudinary';
import { PassThrough } from 'stream';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(fileBuffer: Buffer, folder: string = 'pw-retails'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error('Failed to get secure URL from Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );

    // Create a buffer stream and pipe it to Cloudinary
    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        return reject(error);
      }
      if (result?.result !== 'ok') {
        return reject(new Error('Failed to delete image from Cloudinary'));
      }
      resolve();
    });
  });
}

export function getPublicIdFromUrl(url: string): string | null {
  const matches = url.match(/upload\/v\d+\/([^/]+)\./);
  return matches ? matches[1] : null;
}
