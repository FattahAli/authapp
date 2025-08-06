"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const validation_1 = require("../middleware/validation");
const auth_2 = require("../middleware/auth");
const upload_1 = __importDefault(require("../utils/upload"));
const router = (0, express_1.Router)();
router.post('/signup', upload_1.default.single('profilePicture'), validation_1.validateSignup, auth_1.signup);
router.post('/login', validation_1.validateLogin, auth_1.login);
router.post('/oauth/login', auth_1.oauthLogin);
router.post('/logout', auth_1.logout);
router.get('/me', auth_2.authenticateToken, auth_1.getMe);
router.post('/reset-password', auth_2.authenticateToken, validation_1.validatePasswordReset, auth_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map