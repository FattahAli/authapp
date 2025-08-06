"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordReset = exports.validateProfileUpdate = exports.validateLogin = exports.validateSignup = void 0;
const zod_1 = require("zod");
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    name: zod_1.z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    age: zod_1.z
        .string()
        .transform((val) => parseInt(val))
        .pipe(zod_1.z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120')),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
        errorMap: () => ({ message: 'Please select a valid gender' }),
    }),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const profileUpdateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    age: zod_1.z
        .string()
        .transform((val) => parseInt(val))
        .pipe(zod_1.z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120')),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
        errorMap: () => ({ message: 'Please select a valid gender' }),
    }),
});
const passwordResetSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});
const validateSignup = (req, res, next) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(400).json({ message: 'Invalid request data' });
    }
};
exports.validateSignup = validateSignup;
const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(400).json({ message: 'Invalid request data' });
    }
};
exports.validateLogin = validateLogin;
const validateProfileUpdate = (req, res, next) => {
    try {
        const validatedData = profileUpdateSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(400).json({ message: 'Invalid request data' });
    }
};
exports.validateProfileUpdate = validateProfileUpdate;
const validatePasswordReset = (req, res, next) => {
    try {
        passwordResetSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(400).json({ message: 'Invalid request data' });
    }
};
exports.validatePasswordReset = validatePasswordReset;
//# sourceMappingURL=validation.js.map