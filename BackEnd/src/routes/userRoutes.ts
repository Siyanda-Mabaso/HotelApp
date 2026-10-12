
import { Router } from "express";

import {
    register,
    login,
    getAllUsers,
    getUsersById,
    updateUserById,
    deleteUserById
} from "../controllers/userControllers"

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/users", getAllUsers);

router.get("/users/:id", getUsersById);

router.put("/users/:id", updateUserById);

router.delete("/users/:id", deleteUserById);

export default router;