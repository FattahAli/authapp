"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const authenticateToken = async (req, res, next) => {
    try {
        console.log('Auth middleware: Checking authentication');
        console.log('Auth middleware: Cookies:', req.cookies);
        console.log('Auth middleware: JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('Auth middleware: NODE_ENV:', process.env.NODE_ENV);
        const token = req.cookies.token;
        if (!token) {
            console.log('Auth middleware: No token found in cookies');
            return res.status(401).json({ message: 'Access token required' });
        }
        console.log('Auth middleware: Token found, verifying...');
        console.log('Auth middleware: Token length:', token.length);
        console.log('Auth middleware: Token preview:', token.substring(0, 20) + '...');
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log('Auth middleware: Token decoded, userId:', decoded.userId);
        }
        catch (jwtError) {
            console.log('Auth middleware: JWT verification failed:', jwtError);
            throw jwtError;
        }
        const user = await database_1.default.user.findUnique({
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
            oauthProvider: user.oauthProvider || undefined,
            oauthId: user.oauthId || undefined,
            gender: user.gender
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.default.user.findUnique({
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
                oauthProvider: user.oauthProvider || undefined,
                oauthId: user.oauthId || undefined,
                gender: user.gender
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map