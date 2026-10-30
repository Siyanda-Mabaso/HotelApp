import { Pool } from "pg";
import dotenv from "dotenv";
import dns from "dns";
import net from "net";
import { createUserTable } from "../services/userServices";
import { createHotelTable } from "../services/hotelServices";
import { createBookingTable } from "../services/bookingServices";
import { createReviewTable } from "../services/reviewServices";
import { createFavouriteTable } from "../services/favouriteServices";
import { createRoomTable } from "../services/roomServices";
import { createImageTable } from "../services/imageServices";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
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
      await createImageTable();
    await createRoomTable();
    await createBookingTable();
    await createReviewTable();
    await createFavouriteTable();
  
    console.log("Database tables checked successfully");
};
