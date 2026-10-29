
import { Router } from "express";

import {
    register,
    login,
    getAllUsers,
    getUsersById,
    updateUserById,
    deleteUserById,
    getMyProfile,
    updateMyProfile
} from "../controllers/userControllers";

import {
    protect,
    adminOnly
} from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated profile routes
router.get("/users/me", protect, getMyProfile);
router.put("/users/me", protect, updateMyProfile);

// Admin-only user listing
router.get("/users", protect, adminOnly, getAllUsers);

// User-specific routes
router.get("/users/:id", protect, getUsersById);
router.put("/users/:id", protect, updateUserById);

// Admin-only user deletion
router.delete("/users/:id", protect, adminOnly, deleteUserById);

export default router;
