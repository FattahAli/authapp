"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.oauthLogin = exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const upload_1 = require("../utils/upload");
const oauth_1 = require("../utils/oauth");
const signJWT = (payload, secret) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
};
const signup = async (req, res) => {
    try {
        const { email, password, name, age, gender } = req.body;
        const profilePictureFile = req.file;
        console.log('Signup request received:', { email, name, age, gender, hasFile: !!profilePictureFile });
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                oauthProvider: true,
                password: true,
            },
        });
        if (existingUser) {
            if (existingUser.oauthProvider) {
                return res.status(409).json({
                    message: `Email ${email} is already associated with a ${existingUser.oauthProvider} account. Please use ${existingUser.oauthProvider} to sign in.`,
                    existingProvider: existingUser.oauthProvider
                });
            }
            else {
                return res.status(400).json({ message: 'User already exists' });
            }
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        let profilePictureUrl;
        if (profilePictureFile) {
            try {
                console.log('Uploading profile picture to Cloudinary...');
                const uploadResult = await (0, upload_1.uploadToCloudinary)(profilePictureFile);
                profilePictureUrl = uploadResult.secure_url;
                console.log('Profile picture uploaded successfully:', profilePictureUrl);
            }
            catch (uploadError) {
                console.error('Profile picture upload failed:', uploadError);
                return res.status(500).json({
                    message: 'Failed to upload profile picture. Please try again.',
                    error: process.env.NODE_ENV === 'development' ? uploadError : undefined
                });
            }
        }
        console.log('Creating user in database...');
        const user = await database_1.default.user.create({
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
        const payload = {
            userId: user.id,
            email: user.email,
        };
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        if (!process.env.JWT_SECRET) {
            console.warn('JWT_SECRET not set, using fallback secret');
        }
        const token = signJWT(payload, jwtSecret);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log('Signup completed successfully for user:', user.id);
        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    }
    catch (error) {
        console.error('Signup error:', error);
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
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const payload = {
            userId: user.id,
            email: user.email,
        };
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const token = signJWT(payload, jwtSecret);
        console.log('Login: JWT token generated, length:', token.length);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
const oauthLogin = async (req, res) => {
    try {
        const { provider, accessToken, userData } = req.body;
        console.log('Backend: OAuth login request:', {
            provider,
            accessTokenLength: accessToken?.length,
            userData
        });
        const oauthUserData = await oauth_1.OAuthService.verifyOAuthToken(provider, accessToken);
        console.log('Backend: OAuth user data verified:', oauthUserData);
        let user = await database_1.default.user.findFirst({
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
            if (!userData) {
                console.log('Backend: No userData provided, returning 404');
                return res.status(404).json({
                    message: 'User not found. Please create a new account.',
                    requiresNewAccount: true
                });
            }
            const userCreateData = {
                email: oauthUserData.email,
                name: userData.name || oauthUserData.name,
                profilePicture: oauthUserData.picture,
                oauthProvider: provider,
                oauthId: oauthUserData.id,
            };
            if (userData.age)
                userCreateData.age = parseInt(userData.age);
            if (userData.gender)
                userCreateData.gender = userData.gender;
            console.log('Backend: Creating new user with data:', userCreateData);
            user = await database_1.default.user.create({
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
        }
        else {
            if (user.password && (!user.oauthProvider || user.oauthProvider !== provider)) {
                console.log('Backend: Email exists with password, requiring password authentication');
                return res.status(409).json({
                    message: `Email ${oauthUserData.email} is already registered with a password. Please use your password to sign in.`,
                    requiresPassword: true,
                    email: oauthUserData.email
                });
            }
            if (user.oauthProvider && user.oauthProvider !== provider) {
                console.log('Backend: Email already exists with different OAuth provider');
                return res.status(409).json({
                    message: `Email ${oauthUserData.email} is already associated with a ${user.oauthProvider} account. Please use ${user.oauthProvider} to sign in.`,
                    existingProvider: user.oauthProvider
                });
            }
            if (userData) {
                const updateData = {};
                if (userData.name)
                    updateData.name = userData.name;
                if (userData.age)
                    updateData.age = parseInt(userData.age);
                if (userData.gender)
                    updateData.gender = userData.gender;
                if (oauthUserData.picture)
                    updateData.profilePicture = oauthUserData.picture;
                if (!user.oauthProvider || !user.oauthId) {
                    updateData.oauthProvider = provider;
                    updateData.oauthId = oauthUserData.id;
                }
                if (Object.keys(updateData).length > 0) {
                    console.log('Backend: Updating existing user with data:', updateData);
                    user = await database_1.default.user.update({
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
                }
                else {
                    console.log('Backend: No updates needed for existing user');
                }
            }
            if (user.oauthProvider && (!user.age || !user.gender)) {
                console.log('Backend: OAuth user has incomplete profile, marking as new user');
                isNewUser = true;
            }
        }
        const payload = {
            userId: user.id,
            email: user.email,
        };
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const token = signJWT(payload, jwtSecret);
        console.log('Backend: JWT token generated for user:', user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log('Backend: Sending successful response');
        res.json({
            message: 'OAuth login successful',
            user,
            isNewUser,
        });
    }
    catch (error) {
        console.error('Backend: OAuth login error:', error);
        res.status(500).json({ message: 'OAuth login failed' });
    }
};
exports.oauthLogin = oauthLogin;
const resetPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        const user = await database_1.default.user.findUnique({
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
        if (!user.password) {
            return res.status(400).json({ message: 'Password reset is not available for OAuth accounts' });
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        const saltRounds = 12;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.js.map