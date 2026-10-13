import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";
import { createUser, verifyUserPassword, findAllUsers, findUserById, updateUser, deleteUser } from "../services/userServices";

// Register
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
            res.status(400).json({ message: "Name, email and password are required" }); return;
        }

        if (password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters" }); return;
        }

        const user = await createUser(email.trim().toLowerCase(), password, name.trim());
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
        if (error.message === "Email already registered") {
            res.status(409).json({ message: error.message }); return;
        }
        console.error("Registration error:", error);
        res.status(500).json({ message: "Failed to register user" });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            res.status(400).json({ message: "Email and password are required" }); return;
        }

        const user = await verifyUserPassword(email.trim().toLowerCase(), password);
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" }); return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is missing from the .env file");
            res.status(500).json({ message: "Authentication configuration error" }); return;
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "1d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to log in" });
    }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await findAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to retrieve users" });
    }
};


export const getUsersById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({ message: "Please log in first" });
            return;
        }

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        // Customers can only view their own profiles.
        if (currentUser.role !== "admin" && currentUser.userId !== id) {
            res.status(403).json({
                message: "You can only view your own profile",
            });
            return;
        }

        const user = await findUserById(id);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Never return password hashes.
        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Failed to retrieve user" });
    }
};

// Update user by ID

export const updateUserById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const currentUser = req.user;
        const { name, email } = req.body;

        if (!currentUser) {
            res.status(401).json({ message: "Please log in first" });
            return;
        }

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        // Customers can only edit their own profiles.
        if (currentUser.role !== "admin" && currentUser.userId !== id) {
            res.status(403).json({
                message: "You can only update your own profile",
            });
            return;
        }

        if (name === undefined && email === undefined) {
            res.status(400).json({
                message: "Provide a name or email to update",
            });
            return;
        }

        if (
            (name !== undefined && typeof name !== "string") ||
            (email !== undefined && typeof email !== "string")
        ) {
            res.status(400).json({
                message: "Name and email must be text",
            });
            return;
        }

        if (
            (name !== undefined && !name.trim()) ||
            (email !== undefined && !email.trim())
        ) {
            res.status(400).json({
                message: "Name and email cannot be empty",
            });
            return;
        }

        const user = await updateUser(
            id,
            name === undefined ? "" : name.trim(),
            email === undefined ? "" : email.trim().toLowerCase()
        );

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(409).json({
                message: "Email is already in use",
            });
            return;
        }

        console.error("Update user error:", error);
        res.status(500).json({
            message: "Failed to update profile",
        });
    }
};

// Delete user by ID
export const deleteUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid user ID" }); return;
        }

        const deleted = await deleteUser(id);
        if (!deleted) {
            res.status(404).json({ message: "User not found" }); return;
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};
