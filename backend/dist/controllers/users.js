"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getAllUsers = exports.updateProfile = void 0;
const database_1 = __importDefault(require("../config/database"));
const upload_1 = require("../utils/upload");
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, age, gender } = req.body;
        const profilePictureFile = req.file;
        const currentUser = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { profilePicture: true },
        });
        let profilePictureUrl;
        if (profilePictureFile) {
            if (currentUser?.profilePicture) {
                try {
                    const publicId = currentUser.profilePicture.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        await (0, upload_1.deleteFromCloudinary)(publicId);
                    }
                }
                catch (error) {
                    console.error('Error deleting old profile picture:', error);
                }
            }
            const uploadResult = await (0, upload_1.uploadToCloudinary)(profilePictureFile);
            profilePictureUrl = uploadResult.secure_url;
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(age && { age: parseInt(age.toString()) }),
                ...(gender && { gender }),
                ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
                gender: true,
                profilePicture: true,
                oauthProvider: true,
                oauthId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            database_1.default.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    age: true,
                    gender: true,
                    profilePicture: true,
                    oauthProvider: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            database_1.default.user.count(),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
                gender: true,
                profilePicture: true,
                oauthProvider: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserById = getUserById;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                profilePicture: true,
                oauthProvider: true
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.profilePicture) {
            try {
                const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await (0, upload_1.deleteFromCloudinary)(publicId);
                }
            }
            catch (error) {
                console.error('Error deleting profile picture from Cloudinary:', error);
            }
        }
        await database_1.default.user.delete({
            where: { id },
        });
        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: user.id,
                oauthProvider: user.oauthProvider
            }
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=users.js.map