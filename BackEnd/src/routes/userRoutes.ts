
import { Router } from "express";

import {
    register,
    login,
    getAllUsers,
    getUsersById,
    updateUserById,
    deleteUserById
} from "../controllers/userControllers";

import {
    protect,
    adminOnly
} from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated routes
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, getUsersById);
router.put("/users/:id", protect, updateUserById);

// Admin-only user deletion
router.delete("/users/:id", protect, adminOnly, deleteUserById);

export default router;