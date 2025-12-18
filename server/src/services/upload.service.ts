import fs from 'fs';
import path from 'path';
import { deleteFromCloudinary, uploadToCloudinary } from '../config';
import { ApiError, log } from '../utils';
import { FILE_UPLOAD } from '../utils/constants';

class UploadService {
  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }> {
    // Validate file type
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
      log.warn('Invalid file type uploaded', { mimetype: file.mimetype, filename: file.originalname });
      throw ApiError.badRequest(
        `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      log.warn('File too large', { size: file.size, maxSize: FILE_UPLOAD.MAX_SIZE });
      throw ApiError.badRequest(
        `File too large. Maximum size: ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`
      );
    }

    try {
      const result = await uploadToCloudinary(file.path, 'campus-fixit/issues');

      // Delete local file after upload
      await this.deleteLocalFile(file.path);

      log.info('Image uploaded to Cloudinary', { publicId: result.publicId });

      return result;
    } catch (error) {
      // Clean up local file on error
      await this.deleteLocalFile(file.path);
      log.error('Failed to upload image to Cloudinary', error, { filename: file.originalname });
      throw ApiError.internal('Failed to upload image');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      log.debug('No publicId provided for image deletion');
      return;
    }

    try {
      await deleteFromCloudinary(publicId);
      log.info('Image deleted from Cloudinary', { publicId });
    } catch (error) {
      log.error('Failed to delete image from Cloudinary', error, { publicId });
      // Don't throw - image deletion is non-critical
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: Express.Multer.File[]
  ): Promise<{ url: string; publicId: string }[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      log.info('Multiple images uploaded', { count: results.length });
      
      return results;
    } catch (error) {
      log.error('Failed to upload multiple images', error);
      throw error;
    }
  }

  /**
   * Delete local file
   */
  private async deleteLocalFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log.debug('Local file deleted', { filePath });
      }
    } catch (error) {
      log.error('Failed to delete local file', error, { filePath });
    }
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      log.debug('Upload directory created', { uploadDir });
    }
    
    return uploadDir;
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${ext}`;
  }
}

export const uploadService = new UploadService();
export default uploadService;
