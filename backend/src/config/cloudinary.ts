import path from 'path';
import dotenv from 'dotenv';

// Explicitly load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || 'demo').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '123456789012345').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz123').trim(),
  secure: true,
});

export default cloudinary;
