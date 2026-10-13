import { query } from "../config/database";
import { Booking } from "../types/booking.types";

// Create bookings table
export const createBookingTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,

                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

                hotel_id INTEGER NOT NULL
                    REFERENCES hotels(id) ON DELETE CASCADE,

                check_in DATE NOT NULL,
                check_out DATE NOT NULL,

                rooms INTEGER NOT NULL CHECK (rooms > 0),
                guests INTEGER NOT NULL CHECK (guests > 0),

                total_price NUMERIC(10, 2) NOT NULL
                    CHECK (total_price >= 0),

                status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (
                        status IN ('pending', 'confirmed', 'cancelled')
                    ),

                created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT valid_booking_dates
                    CHECK (check_out > check_in)
            )
        `);

        console.log("Bookings table is ready");
    } catch (error) {
        console.error("Failed to create bookings table:", error);
        throw error;
    }
};

// Create a booking
export const createBooking = async (
    userId: number,
    hotelId: number,
    checkIn: string,
    checkOut: string,
    rooms: number,
    guests: number,
    totalPrice: number
): Promise<Booking> => {
    const { rows } = await query(
        `INSERT INTO bookings (
            user_id,
            hotel_id,
            check_in,
            check_out,
            rooms,
            guests,
            total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            userId,
            hotelId,
            checkIn,
            checkOut,
            rooms,
            guests,
            totalPrice
        ]
    );

    return rows[0];
};

// Get all bookings
export const findAllBookings = async (): Promise<Booking[]> => {
    const { rows } = await query(
        `SELECT * FROM bookings ORDER BY created_at DESC`
    );

    return rows;
};

// Get bookings for one user
export const findBookingsByUserId = async (
    userId: number
): Promise<Booking[]> => {
    const { rows } = await query(
        `SELECT * FROM bookings
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return rows;
};

// Get one booking by ID
export const findBookingById = async (
    id: number
): Promise<Booking | null> => {
    const { rows } = await query(
        `SELECT * FROM bookings WHERE id = $1`,
        [id]
    );

    return rows[0] || null;
};

// Cancel a booking
export const cancelBooking = async (
    id: number,
    userId: number
): Promise<Booking | null> => {
    const { rows } = await query(
        `UPDATE bookings
         SET status = 'cancelled'
         WHERE id = $1
           AND user_id = $2
           AND status <> 'cancelled'
         RETURNING *`,
        [id, userId]
    );

    return rows[0] || null;
};

