
import { query } from "../config/database";
import { Room } from "../types/room.types";

// Create the rooms table
export const createRoomTable = async (): Promise<void> => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                hotel_id INTEGER NOT NULL
                    REFERENCES hotels(id) ON DELETE CASCADE,
                room_type VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                capacity INTEGER NOT NULL CHECK (capacity > 0),
                price_per_night NUMERIC(10, 2) NOT NULL
                    CHECK (price_per_night >= 0),
                total_rooms INTEGER NOT NULL
                    CHECK (total_rooms >= 0),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT unique_room_type_per_hotel
                    UNIQUE (hotel_id, room_type)
            )
        `);

        console.log("Rooms table is ready");
    } catch (error) {
        console.error("Failed to create rooms table:", error);
        throw error;
    }
};

// Add a room type to a hotel
export const createRoom = async (
    hotel_id: number,
    room_type: string,
    description: string,
    capacity: number,
    price_per_night: number,
    total_rooms: number
): Promise<Room> => {
    const { rows } = await query(
        `INSERT INTO rooms
            (
                hotel_id,
                room_type,
                description,
                capacity,
                price_per_night,
                total_rooms
            )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            hotel_id,
            room_type,
            description,
            capacity,
            price_per_night,
            total_rooms
        ]
    );

    return rows[0];
};

// Get all room types for one hotel
export const findRoomsByHotelId = async (
    hotel_id: number
): Promise<Room[]> => {
    const { rows } = await query(
        `SELECT * FROM rooms
         WHERE hotel_id = $1
         ORDER BY price_per_night ASC`,
        [hotel_id]
    );

    return rows;
};

// Get one room type by its ID
export const findRoomById = async (
    id: number
): Promise<Room | null> => {
    const { rows } = await query(
        `SELECT * FROM rooms
         WHERE id = $1`,
        [id]
    );

    return rows[0] || null;
};

// Update a room type
export const updateRoom = async (
    id: number,
    room_type: string,
    description: string,
    capacity: number,
    price_per_night: number,
    total_rooms: number
): Promise<Room | null> => {
    const { rows } = await query(
        `UPDATE rooms
         SET room_type = $1,
             description = $2,
             capacity = $3,
             price_per_night = $4,
             total_rooms = $5
         WHERE id = $6
         RETURNING *`,
        [
            room_type,
            description,
            capacity,
            price_per_night,
            total_rooms,
            id
        ]
    );

    return rows[0] || null;
};
// Delete a room type by its ID
export const deleteRoom = async (
    id: number
): Promise<Room | null> => {
    const { rows } = await query(
        `DELETE FROM rooms
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return rows[0] || null;
};


