import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class CloudinaryService {
  /**
   * Upload buffer to Cloudinary
   */
  static async uploadBuffer(
    buffer: Buffer,
    folder: string = 'portfolio',
    resourceType: 'image' | 'raw' | 'auto' = 'auto',
    originalName?: string
  ): Promise<{ url: string; public_id: string; bytes: number }> {
    // If Cloudinary keys are placeholder, return local fallback simulated URL
    if (
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === '123456789012345'
    ) {
      const mockId = `mock_${Date.now()}`;
      return {
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
        public_id: mockId,
        bytes: buffer.length,
      };
    }

    const isPdf = Boolean(originalName?.toLowerCase().endsWith('.pdf'));
    const uploadOptions: Record<string, any> = {
      folder: `basi_portfolio/${folder}`,
      resource_type: isPdf ? 'auto' : resourceType,
    };

    if (isPdf) {
      uploadOptions.format = 'pdf';
    }

    if (originalName) {
      const baseClean = originalName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .slice(0, 50);
      uploadOptions.public_id = `${baseClean}_${Date.now()}`;
      uploadOptions.use_filename = true;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned empty result'));

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
          });
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete resource from Cloudinary
   */
  static async deleteResource(publicId: string): Promise<boolean> {
    try {
      if (
        !process.env.CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_KEY === '123456789012345'
      ) {
        return true;
      }
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch {
      return false;
    }
  }
}

export default CloudinaryService;
