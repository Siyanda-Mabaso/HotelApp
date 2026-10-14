import { Pool } from "pg";
import dotenv from "dotenv";
import { createUserTable } from "../services/userServices";
import { createHotelTable } from "../services/hotelServices";
import { createBookingTable } from "../services/bookingServices";
import { createReviewTable } from "../services/reviewServices";

dotenv.config();

const pool = new Pool({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: parseInt(process.env.DB_PORT || "5432"),
});

export const query = (text: string, params?: any[]) => {
return pool.query(text, params);
};

// Test database connection
export const testDbConnection = async (): Promise<void> => {
try {
const client = await pool.connect();


    console.log("Database connection successful");

    client.release();
} catch (error) {
    console.error("Unable to connect to database:", error);
    throw error;
}

};

// Check and create database tables
export const dbCheckTables = async (): Promise<void> => {
await testDbConnection();

await createUserTable();
await createHotelTable();
await createBookingTable();
await createReviewTable();
console.log("Database tables checked successfully");
};
