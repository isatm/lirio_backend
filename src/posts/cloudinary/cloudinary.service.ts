import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';

export interface UploadedImage {
  url: string;
  publicId: string;
}

export interface UploadImageOptions {
  folder?: string;
  transformation?: UploadApiOptions['transformation'];
}

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: { buffer: Buffer },
    options: UploadImageOptions = {},
  ): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder ?? 'liriohibisco/posts',
          resource_type: 'image',
          ...(options.transformation
            ? { transformation: options.transformation }
            : {}),
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('No se pudo subir la imagen'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /** Borra una imagen de Cloudinary sin interrumpir el flujo si ya no existe. */
  async destroyImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      // La imagen pudo haberse eliminado antes: no debe bloquear al usuario.
    }
  }
}
