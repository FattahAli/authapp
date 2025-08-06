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
    console.log('Auth middleware: Checking authentication');
    console.log('Auth middleware: Cookies:', req.cookies);
    const token = req.cookies.token;

    if (!token) {
      console.log('Auth middleware: No token found in cookies');
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('Auth middleware: Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    console.log('Auth middleware: Token decoded, userId:', decoded.userId);
    
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
      console.log('Auth middleware: User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('Auth middleware: User found, authentication successful');

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