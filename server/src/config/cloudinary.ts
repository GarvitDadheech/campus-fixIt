import { v2 as cloudinary } from 'cloudinary';
import { log } from '../utils/logger';
import { env } from './env';

export const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  log.info('Cloudinary configured');
};

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'campus-fixit'
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error}`);
  }
};

export { cloudinary };
export default configureCloudinary;
