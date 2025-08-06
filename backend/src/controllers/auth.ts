import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { SignupRequest, LoginRequest, JWTPayload, OAuthLoginRequest, OAuthProvider } from '../types';
import { uploadToCloudinary } from '../utils/upload';
import { OAuthService } from '../utils/oauth';
import { AuthenticatedRequest } from '../types';

// Simple JWT signing function to avoid TypeScript issues
const signJWT = (payload: any, secret: string) => {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, age, gender }: SignupRequest = req.body;
    const profilePictureFile = req.file;

    console.log('Signup request received:', { email, name, age, gender, hasFile: !!profilePictureFile });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        oauthProvider: true,
        password: true,
      },
    });

    if (existingUser) {
      // Check if the existing user has an OAuth provider
      if (existingUser.oauthProvider) {
        return res.status(409).json({ 
          message: `Email ${email} is already associated with a ${existingUser.oauthProvider} account. Please use ${existingUser.oauthProvider} to sign in.`,
          existingProvider: existingUser.oauthProvider
        });
      } else {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Upload profile picture if provided
    let profilePictureUrl: string | undefined;
    if (profilePictureFile) {
      try {
        console.log('Uploading profile picture to Cloudinary...');
        const uploadResult = await uploadToCloudinary(profilePictureFile);
        profilePictureUrl = uploadResult.secure_url;
        console.log('Profile picture uploaded successfully:', profilePictureUrl);
      } catch (uploadError) {
        console.error('Profile picture upload failed:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload profile picture. Please try again.',
          error: process.env.NODE_ENV === 'development' ? uploadError : undefined
        });
      }
    }

    // Create user
    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        age: parseInt(age.toString()),
        gender,
        profilePicture: profilePictureUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('User created successfully:', user.id);

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set, using fallback secret');
    }

    const token = signJWT(payload, jwtSecret);

    // Set JWT in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('Signup completed successfully for user:', user.id);

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ message: 'User already exists' });
      }
      if (error.message.includes('Database connection')) {
        return res.status(500).json({ message: 'Database connection error. Please try again.' });
      }
      if (error.message.includes('Validation')) {
        return res.status(400).json({ message: 'Invalid data provided' });
      }
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = signJWT(payload, jwtSecret);
    console.log('Login: JWT token generated, length:', token.length);

    // Set JWT in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log('Login: Cookie set with options:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // The user is already attached to req by the auth middleware
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 

export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { provider, accessToken, userData }: OAuthLoginRequest & { userData?: any } = req.body;
    console.log('Backend: OAuth login request:', { 
      provider, 
      accessTokenLength: accessToken?.length,
      userData 
    });

    // Verify the OAuth token
    const oauthUserData = await OAuthService.verifyOAuthToken(provider, accessToken);
    console.log('Backend: OAuth user data verified:', oauthUserData);

    // Check if user exists with this OAuth ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { oauthId: oauthUserData.id, oauthProvider: provider },
          { email: oauthUserData.email }
        ]
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
        password: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log('Backend: User lookup result:', user ? 'User found' : 'User not found');

    let isNewUser = false;

    if (!user) {
      // Check if userData is provided for new user creation
      if (!userData) {
        console.log('Backend: No userData provided, returning 404');
        return res.status(404).json({ 
          message: 'User not found. Please create a new account.',
          requiresNewAccount: true 
        });
      }

      // Create new user with OAuth data
      const userCreateData: any = {
        email: oauthUserData.email,
        name: userData.name || oauthUserData.name,
        profilePicture: oauthUserData.picture,
        oauthProvider: provider,
        oauthId: oauthUserData.id,
      };

      // Add custom user data if provided
      if (userData.age) userCreateData.age = parseInt(userData.age);
      if (userData.gender) userCreateData.gender = userData.gender;

      console.log('Backend: Creating new user with data:', userCreateData);

      user = await prisma.user.create({
        data: userCreateData,
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          gender: true,
          profilePicture: true,
          oauthProvider: true,
          oauthId: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      isNewUser = true;
      console.log('Backend: New user created:', user.id);
    } else {
      // User exists - check if it's a password-based account
      if (user.password && (!user.oauthProvider || user.oauthProvider !== provider)) {
        console.log('Backend: Email exists with password, requiring password authentication');
        return res.status(409).json({ 
          message: `Email ${oauthUserData.email} is already registered with a password. Please use your password to sign in.`,
          requiresPassword: true,
          email: oauthUserData.email
        });
      }

      // Check if it's a different OAuth provider
      if (user.oauthProvider && user.oauthProvider !== provider) {
        console.log('Backend: Email already exists with different OAuth provider');
        return res.status(409).json({ 
          message: `Email ${oauthUserData.email} is already associated with a ${user.oauthProvider} account. Please use ${user.oauthProvider} to sign in.`,
          existingProvider: user.oauthProvider
        });
      }

      // User exists with same OAuth provider or no OAuth provider - proceed with login/update
      if (userData) {
        const updateData: any = {};
        
        // Only update if new data is provided
        if (userData.name) updateData.name = userData.name;
        if (userData.age) updateData.age = parseInt(userData.age);
        if (userData.gender) updateData.gender = userData.gender;
        if (oauthUserData.picture) updateData.profilePicture = oauthUserData.picture;
        
        // Update OAuth data if not already set
        if (!user.oauthProvider || !user.oauthId) {
          updateData.oauthProvider = provider;
          updateData.oauthId = oauthUserData.id;
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          console.log('Backend: Updating existing user with data:', updateData);
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
              id: true,
              email: true,
              name: true,
              age: true,
              gender: true,
              profilePicture: true,
              oauthProvider: true,
              oauthId: true,
              password: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          console.log('Backend: User updated:', user.id);
        } else {
          console.log('Backend: No updates needed for existing user');
        }
      }
      
      // Check if OAuth user has incomplete profile (missing age or gender)
      if (user.oauthProvider && (!user.age || !user.gender)) {
        console.log('Backend: OAuth user has incomplete profile, marking as new user');
        isNewUser = true;
      }
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = signJWT(payload, jwtSecret);

    console.log('Backend: JWT token generated for user:', user.id);

    // Set JWT in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('Backend: Sending successful response');
    res.json({
      message: 'OAuth login successful',
      user,
      isNewUser,
    });
  } catch (error) {
    console.error('Backend: OAuth login error:', error);
    res.status(500).json({ message: 'OAuth login failed' });
  }
}; 

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        oauthProvider: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (non-OAuth user)
    if (!user.password) {
      return res.status(400).json({ message: 'Password reset is not available for OAuth accounts' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 