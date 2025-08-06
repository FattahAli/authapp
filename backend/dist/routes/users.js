"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../utils/upload"));
const router = (0, express_1.Router)();
router.put('/profile', auth_1.authenticateToken, upload_1.default.single('profilePicture'), validation_1.validateProfileUpdate, users_1.updateProfile);
router.get('/', auth_1.optionalAuth, users_1.getAllUsers);
router.get('/:id', auth_1.optionalAuth, users_1.getUserById);
router.delete('/:id', auth_1.authenticateToken, users_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map