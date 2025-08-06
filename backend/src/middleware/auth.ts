import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, UserWithoutPassword, Gender, OAuthProvider } from '../types';
import prisma from '../config/database';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      ...user,
      age: user.age || undefined,
      profilePicture: user.profilePicture || undefined,
      oauthProvider: user.oauthProvider as OAuthProvider || undefined,
      oauthId: user.oauthId || undefined,
      gender: user.gender as Gender
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (user) {
      req.user = {
        ...user,
        age: user.age || undefined,
        profilePicture: user.profilePicture || undefined,
        oauthProvider: user.oauthProvider as OAuthProvider || undefined,
        oauthId: user.oauthId || undefined,
        gender: user.gender as Gender
      };
    }
    
    next();
  } catch (error) {
    next();
  }
}; 