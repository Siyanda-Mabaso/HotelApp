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

        room_id INTEGER
          REFERENCES rooms(id) ON DELETE RESTRICT,

        check_in DATE NOT NULL,
        check_out DATE NOT NULL,

        rooms INTEGER NOT NULL CHECK (rooms > 0),
        guests INTEGER NOT NULL CHECK (guests > 0),

        total_price NUMERIC(10, 2) NOT NULL
          CHECK (total_price >= 0),

        payment_reference VARCHAR(100) UNIQUE,

        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (
            status IN ('pending', 'confirmed', 'cancelled')
          ),

        created_at TIMESTAMP NOT NULL DEFAULT NOW(),

        CONSTRAINT valid_booking_dates
          CHECK (check_out > check_in)
      )
    `);

    // Add room_id to an existing bookings table safely
    await query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS room_id INTEGER
      REFERENCES rooms(id) ON DELETE RESTRICT
    `);

    // Add payment_reference to an existing bookings table
    await query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100)
    `);

    // Ensure payment references are unique
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      idx_bookings_payment_reference
      ON bookings(payment_reference)
      WHERE payment_reference IS NOT NULL
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
  totalPrice: number,
  roomId?: number | null,
): Promise<Booking> => {
  const { rows } = await query(
    `INSERT INTO bookings (
      user_id,
      hotel_id,
      check_in,
      check_out,
      rooms,
      guests,
      total_price,
      room_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      userId,
      hotelId,
      checkIn,
      checkOut,
      rooms,
      guests,
      totalPrice,
      roomId ?? null,
    ],
  );

  return rows[0];
};

// Get all bookings with customer, hotel, and room details
export const findAllBookings = async () => {
  const { rows } = await query(
    `SELECT
      bookings.*,
      users.name AS customer_name,
      users.email AS customer_email,
      hotels.name AS hotel_name,
      hotels.city AS hotel_city,
      hotels.country AS hotel_country,
      rooms.room_type AS room_type
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN hotels ON bookings.hotel_id = hotels.id
    LEFT JOIN rooms ON bookings.room_id = rooms.id
    ORDER BY bookings.created_at DESC`,
  );

  return rows;
};

// Get bookings for one user
export const findBookingsByUserId = async (userId: number) => {
  const { rows } = await query(
    `SELECT
      bookings.*,
      hotels.name AS hotel_name,
      hotels.city AS hotel_city,
      hotels.country AS hotel_country,
      rooms.room_type AS room_type
    FROM bookings
    JOIN hotels ON bookings.hotel_id = hotels.id
    LEFT JOIN rooms ON bookings.room_id = rooms.id
    WHERE bookings.user_id = $1
    ORDER BY bookings.created_at DESC`,
    [userId],
  );

  return rows;
};

// Get one booking by ID
export const findBookingById = async (id: number): Promise<Booking | null> => {
  const { rows } = await query(
    `SELECT *
     FROM bookings
     WHERE id = $1`,
    [id],
  );

  return rows[0] || null;
};

// Cancel a booking
export const cancelBooking = async (
  id: number,
  userId: number,
): Promise<Booking | null> => {
  const { rows } = await query(
    `UPDATE bookings
     SET status = 'cancelled'
     WHERE id = $1
       AND user_id = $2
       AND status <> 'cancelled'
     RETURNING *`,
    [id, userId],
  );

  return rows[0] || null;
};

// Permanently delete one booking by ID
// This deletes only the booking record, not the customer account.
export const deleteBookingById = async (
  id: number,
): Promise<Booking | null> => {
  const { rows } = await query(
    `DELETE FROM bookings
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return rows[0] || null;
};

// Count rooms booked for overlapping dates
export const countBookedRooms = async (
  roomId: number,
  checkIn: string,
  checkOut: string,
): Promise<number> => {
  const { rows } = await query(
    `SELECT COALESCE(SUM(rooms), 0) AS booked_rooms
     FROM bookings
     WHERE room_id = $1
       AND status IN ('pending', 'confirmed')
       AND check_in < $3
       AND check_out > $2`,
    [roomId, checkIn, checkOut],
  );

  return Number(rows[0].booked_rooms);
};

// Save Paystack payment reference against a booking
export const saveBookingPaymentReference = async (
  bookingId: number,
  userId: number,
  reference: string,
): Promise<Booking | null> => {
  const { rows } = await query(
    `UPDATE bookings
     SET payment_reference = $3
     WHERE id = $1
       AND user_id = $2
       AND status = 'pending'
       AND payment_reference IS NULL
     RETURNING *`,
    [bookingId, userId, reference],
  );

  return rows[0] || null;
};

// Confirm booking after successful Paystack verification
export const confirmBookingPayment = async (
  bookingId: number,
  userId: number,
  reference: string,
): Promise<Booking | null> => {
  const { rows } = await query(
    `UPDATE bookings
     SET status = 'confirmed'
     WHERE id = $1
       AND user_id = $2
       AND payment_reference = $3
       AND status = 'pending'
     RETURNING *`,
    [bookingId, userId, reference],
  );

  return rows[0] || null;
};
// Clear payment reference if Paystack initialization fails
export const clearBookingPaymentReference = async (
  bookingId: number,
  userId: number,
  reference: string
): Promise<void> => {
  await query(
    `UPDATE bookings
     SET payment_reference = NULL
     WHERE id = $1
       AND user_id = $2
       AND payment_reference = $3
       AND status = 'pending'`,
    [bookingId, userId, reference]
  );
};