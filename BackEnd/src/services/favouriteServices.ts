
import { query } from "../config/database";
import { Favourite } from "../types/favourite.types";

// Create the favourites table
export const createFavouriteTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS favourites (
                id SERIAL PRIMARY KEY,

                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

                hotel_id INTEGER NOT NULL
                    REFERENCES hotels(id) ON DELETE CASCADE,

                created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT unique_user_hotel
                    UNIQUE (user_id, hotel_id)
            )
        `);

        console.log("Favourites table is ready");
    } catch (error) {
        console.error("Failed to create favourites table:", error);
        throw error;
    }
};

// Add a hotel to favourites
export const addFavourite = async (
    userId: number,
    hotelId: number
): Promise<Favourite> => {
    const { rows } = await query(
        `INSERT INTO favourites (user_id, hotel_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, hotelId]
    );

    return rows[0];
};

// Get all favourites belonging to a user
export const findFavouritesByUserId = async (
    userId: number
): Promise<Favourite[]> => {
    const { rows } = await query(
        `SELECT
            favourites.id,
            favourites.user_id,
            favourites.hotel_id,
            favourites.created_at,
            hotels.name AS hotel_name,
            hotels.address,
            hotels.city,
            hotels.country,
            hotels.price_per_night,
            hotels.star_rating
         FROM favourites
         INNER JOIN hotels
            ON favourites.hotel_id = hotels.id
         WHERE favourites.user_id = $1
         ORDER BY favourites.created_at DESC`,
        [userId]
    );

    return rows;
};

// Remove a hotel from favourites
export const removeFavourite = async (
    userId: number,
    hotelId: number
): Promise<Favourite | null> => {
    const { rows } = await query(
        `DELETE FROM favourites
         WHERE user_id = $1 AND hotel_id = $2
         RETURNING *`,
        [userId, hotelId]
    );

    return rows[0] || null;
};