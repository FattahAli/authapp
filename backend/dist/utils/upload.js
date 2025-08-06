"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: 'profile-pictures',
            transformation: [
                { width: 400, height: 400, crop: 'fill' },
                { quality: 'auto' },
            ],
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
            else {
                reject(new Error('Upload failed'));
            }
        });
        uploadStream.end(file.buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = upload;
//# sourceMappingURL=upload.js.map