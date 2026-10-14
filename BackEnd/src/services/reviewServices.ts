
import { query } from "../config/database";
import { Review } from "../types/review.types";

// Create the reviews table
export const createReviewTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,

                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

                hotel_id INTEGER NOT NULL
                    REFERENCES hotels(id) ON DELETE CASCADE,

                rating INTEGER NOT NULL
                    CHECK (rating BETWEEN 1 AND 5),

                comment TEXT NOT NULL,

                created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT unique_user_hotel_review
                    UNIQUE (user_id, hotel_id)
            )
        `);

        console.log("Reviews table is ready");
    } catch (error) {
        console.error("Failed to create reviews table:", error);
        throw error;
    }
};

// Add a review
export const createReview = async (
    userId: number,
    hotelId: number,
    rating: number,
    comment: string
): Promise<Review> => {
    const { rows } = await query(
        `INSERT INTO reviews (user_id, hotel_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, hotelId, rating, comment]
    );

    return rows[0];
};

// Get all reviews for one hotel
export const findReviewsByHotelId = async (
    hotelId: number
): Promise<Review[]> => {
    const { rows } = await query(
        `SELECT
            reviews.id,
            reviews.user_id,
            reviews.hotel_id,
            reviews.rating,
            reviews.comment,
            reviews.created_at,
            reviews.updated_at,
            users.name AS reviewer_name
         FROM reviews
         INNER JOIN users ON reviews.user_id = users.id
         WHERE reviews.hotel_id = $1
         ORDER BY reviews.created_at DESC`,
        [hotelId]
    );

    return rows;
};

// Get reviews written by one user
export const findReviewsByUserId = async (
    userId: number
): Promise<Review[]> => {
    const { rows } = await query(
        `SELECT
            reviews.id,
            reviews.user_id,
            reviews.hotel_id,
            reviews.rating,
            reviews.comment,
            reviews.created_at,
            reviews.updated_at,
            hotels.name AS hotel_name
         FROM reviews
         INNER JOIN hotels ON reviews.hotel_id = hotels.id
         WHERE reviews.user_id = $1
         ORDER BY reviews.created_at DESC`,
        [userId]
    );

    return rows;
};

// Update a review
export const updateReview = async (
    reviewId: number,
    userId: number,
    rating: number,
    comment: string
): Promise<Review | null> => {
    const { rows } = await query(
        `UPDATE reviews
         SET rating = $1,
             comment = $2,
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [rating, comment, reviewId, userId]
    );

    return rows[0] || null;
};

// Delete a review
export const deleteReview = async (
    reviewId: number,
    userId: number
): Promise<Review | null> => {
    const { rows } = await query(
        `DELETE FROM reviews
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [reviewId, userId]
    );

    return rows[0] || null;
};