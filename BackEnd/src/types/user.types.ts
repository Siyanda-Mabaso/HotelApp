export interface User {
    id: number;
    name: string;
    email: string;
    password_hash?: string | null;
    role: "customer" | "admin";
    created_at: Date;
}