
import { query } from "../config/database";
import { Hotel } from "../types/hotel.types";

// Create hotels table
export const createHotelTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS hotels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                country VARCHAR(100) NOT NULL,
                star_rating NUMERIC(2,1),
                price_per_night NUMERIC(10,2) NOT NULL,
                facilities TEXT[] NOT NULL DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW(),

                CONSTRAINT valid_star_rating
                    CHECK (star_rating IS NULL OR star_rating BETWEEN 1 AND 5),

                CONSTRAINT valid_price
                    CHECK (price_per_night >= 0)
            )
        `);

        // Add facilities to existing databases without deleting data.
        await query(`
            ALTER TABLE hotels
            ADD COLUMN IF NOT EXISTS facilities TEXT[] NOT NULL DEFAULT '{}'
        `);

        console.log("Hotels table is ready");
    } catch (error) {
        console.error("Failed to create hotels table:", error);
        throw error;
    }
};

// Add a hotel
export const createHotel = async (
    name: string,
    description: string,
    address: string,
    city: string,
    country: string,
    star_rating: number | null,
    price_per_night: number,
    facilities: string[] = []
): Promise<Hotel> => {
    const { rows } = await query(
        `INSERT INTO hotels (
            name,
            description,
            address,
            city,
            country,
            star_rating,
            price_per_night,
            facilities
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            name,
            description,
            address,
            city,
            country,
            star_rating,
            price_per_night,
            facilities
        ]
    );

    return rows[0];
};

// Get all hotels
export const findAllHotels = async (): Promise<Hotel[]> => {
    const { rows } = await query(
        `SELECT * FROM hotels ORDER BY created_at DESC`
    );

    return rows;
};

// Get a hotel by ID
export const findHotelById = async (
    id: number
): Promise<Hotel | null> => {
    const { rows } = await query(
        `SELECT * FROM hotels WHERE id = $1`,
        [id]
    );

    return rows[0] || null;
};

// Update a hotel
export const updateHotel = async (
    id: number,
    name: string,
    description: string,
    address: string,
    city: string,
    country: string,
    star_rating: number | null,
    price_per_night: number,
    facilities?: string[]
): Promise<Hotel | null> => {
    const { rows } = await query(
        `UPDATE hotels
         SET name = $1,
             description = $2,
             address = $3,
             city = $4,
             country = $5,
             star_rating = $6,
             price_per_night = $7,
             facilities = COALESCE($8::TEXT[], facilities)
         WHERE id = $9
         RETURNING *`,
        [
            name,
            description,
            address,
            city,
            country,
            star_rating,
            price_per_night,
            facilities ?? null,
            id
        ]
    );

    return rows[0] || null;
};

// Delete a hotel
export const deleteHotel = async (id: number): Promise<boolean> => {
    const { rowCount } = await query(
        `DELETE FROM hotels WHERE id = $1`,
        [id]
    );

    return (rowCount ?? 0) > 0;
};
