import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: number;
    email: string;
    role: "customer" | "admin";
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

// Protect routes by verifying the JWT token
export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        // Check whether the token was provided
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Access denied. Please log in.",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!token || !jwtSecret) {
            res.status(401).json({
                message: "Invalid authentication token.",
            });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Attach the authenticated user to the request
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
};

// Allow only administrators
export const adminOnly = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            message: "Please log in first.",
        });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "Access denied. Admin privileges required.",
        });
        return;
    }

    next();
};

