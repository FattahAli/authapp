import { Request, Response } from 'express';
import prisma from '../config/database';
import { UpdateProfileRequest, AuthenticatedRequest } from '../types';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload';

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, age, gender }: UpdateProfileRequest = req.body;
    const profilePictureFile = req.file;

    // Get current user to check if they have an existing profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    let profilePictureUrl: string | undefined;

    if (profilePictureFile) {
      // Delete old profile picture from Cloudinary if it exists
      if (currentUser?.profilePicture) {
        try {
          const publicId = currentUser.profilePicture.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }

      // Upload new profile picture
      const uploadResult = await uploadToCloudinary(profilePictureFile);
      profilePictureUrl = uploadResult.secure_url;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count(),
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
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
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

    // Delete profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting profile picture from Cloudinary:', error);
      }
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id },
    });

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        oauthProvider: user.oauthProvider
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 