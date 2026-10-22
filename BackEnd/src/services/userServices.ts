
import { query } from "../config/database";
import bcrypt from "bcrypt"
import { User } from "../types/user.types";

// Create users table
export const createUserTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'admin')),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log("Users table is ready");
    } catch (error) {
        console.error("Failed to create users table:", error);
        throw error;
    }
};

// Find user by email
export const findUserByEmail = async (
    email: string
): Promise<User | null> => {
    const { rows } = await query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return rows[0] || null;
};

// Register a user
export const createUser = async (
    email: string,
    password: string,
    name: string
): Promise<User> => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { rows } = await query(
        `INSERT INTO users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, role, created_at`,
        [email, passwordHash, name]
    );

    return rows[0];
};

// Verify login credentials
export const verifyUserPassword = async (
    email: string,
    password: string
): Promise<User | null> => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash!
    );

    if (!passwordMatches) {
        return null;
    }

    const { password_hash, ...safeUser } = user;

    return safeUser as User;
};

// Find all users
export const findAllUsers = async (): Promise<User[]> => {
    const { rows } = await query(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY id ASC`
    );

    return rows;
};

// Find user by ID
export const findUserById = async (
    id: number
): Promise<User | null> => {
    const { rows } = await query(
        `SELECT id, name, email, role, created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return rows[0] || null;
};

// Update user details
export const updateUser = async (
    id: number,
    name: string,
    email: string
): Promise<User | null> => {
    const { rows } = await query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email)
         WHERE id = $3
         RETURNING id, name, email, role, created_at`,
        [name || null, email || null, id]
    );

    return rows[0] || null;
};

// Delete user
export const deleteUser = async (
    id: number
): Promise<boolean> => {
    const { rowCount } = await query(
        "DELETE FROM users WHERE id = $1",
        [id]
    );

    return (rowCount ?? 0) > 0;
};