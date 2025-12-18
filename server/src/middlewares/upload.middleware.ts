import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { FILE_UPLOAD } from '../utils/constants';
import { ApiError } from '../utils';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`
      )
    );
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
    files: 1, // Maximum 1 file per request for issues
  },
});

// Export upload middlewares
export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 5);

// Error handling wrapper for multer
export const handleMulterError = (
  err: any,
  req: Request,
  res: any,
  next: any
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        ApiError.badRequest(
          `File too large. Maximum size: ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`
        )
      );
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(ApiError.badRequest('Unexpected file field'));
    }
    return next(ApiError.badRequest(err.message));
  }
  next(err);
};

export default upload;

