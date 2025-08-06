import multer from 'multer';
import { CloudinaryResponse } from '../types';
declare const upload: multer.Multer;
export declare const uploadToCloudinary: (file: Express.Multer.File) => Promise<CloudinaryResponse>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export default upload;
//# sourceMappingURL=upload.d.ts.map