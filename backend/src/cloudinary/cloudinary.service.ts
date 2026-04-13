import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export interface UploadResult {
  url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService {
  private uploadFolder: string;

  constructor(private configService: ConfigService) {
    this.uploadFolder = this.configService.get<string>(
      'CLOUDINARY_UPLOAD_FOLDER',
      'kopma',
    );
  }

  /**
   * Upload image file to Cloudinary
   * @param file - Multer file object
   * @returns UploadResult with url and public_id
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    try {
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.uploadFolder,
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException(
                  `Failed to upload image: ${error.message}`,
                ),
              );
            } else if (result) {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            } else {
              reject(
                new BadRequestException('Upload failed: no result returned'),
              );
            }
          },
        );

        uploadStream.end(file.buffer);
      });

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete image from Cloudinary by public_id
   * @param publicId - Cloudinary public_id of the image
   * @returns boolean indicating success
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param url - Full Cloudinary URL
   * @returns public_id string
   */
  extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z]+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
