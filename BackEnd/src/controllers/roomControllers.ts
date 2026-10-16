

import { Request, Response } from "express";

import {
    createRoom,
    findRoomsByHotelId,
    findRoomById,
    updateRoom,
    deleteRoom
} from "../services/roomServices";

import { findHotelById } from "../services/hotelServices";

// Add a room type to a hotel (Admin only)
export const addRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            hotel_id,
            room_type,
            description,
            capacity,
            price_per_night,
            total_rooms
        } = req.body;

        const hotelId = Number(hotel_id);
        const roomCapacity = Number(capacity);
        const roomPrice = Number(price_per_night);
        const roomQuantity = Number(total_rooms);

        if (
            !Number.isInteger(hotelId) ||
            hotelId <= 0 ||
            typeof room_type !== "string" ||
            !room_type.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Number.isInteger(roomCapacity) ||
            roomCapacity <= 0 ||
            !Number.isFinite(roomPrice) ||
            roomPrice < 0 ||
            !Number.isInteger(roomQuantity) ||
            roomQuantity < 0
        ) {
            res.status(400).json({
                message: "Please provide valid room details."
            });
            return;
        }

        const hotel = await findHotelById(hotelId);

        if (!hotel) {
            res.status(404).json({
                message: "Hotel not found."
            });
            return;
        }

        const room = await createRoom(
            hotelId,
            room_type.trim(),
            description.trim(),
            roomCapacity,
            roomPrice,
            roomQuantity
        );

        res.status(201).json({
            message: "Room type added successfully.",
            room
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(409).json({
                message: "This room type already exists for this hotel."
            });
            return;
        }

        console.error("Error adding room:", error);

        res.status(500).json({
            message: "Failed to add room type."
        });
    }
};

// Get all room types for one hotel
export const getRoomsByHotel = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const hotelId = Number(req.params.hotelId);

        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            res.status(400).json({
                message: "Invalid hotel ID."
            });
            return;
        }

        const hotel = await findHotelById(hotelId);

        if (!hotel) {
            res.status(404).json({
                message: "Hotel not found."
            });
            return;
        }

        const rooms = await findRoomsByHotelId(hotelId);

        res.status(200).json({
            message: "Room types retrieved successfully.",
            rooms
        });
    } catch (error) {
        console.error("Error retrieving room types:", error);

        res.status(500).json({
            message: "Failed to retrieve room types."
        });
    }
};

// Get one room type by its ID
export const getRoomById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const roomId = Number(req.params.id);

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.status(400).json({
                message: "Invalid room ID."
            });
            return;
        }

        const room = await findRoomById(roomId);

        if (!room) {
            res.status(404).json({
                message: "Room type not found."
            });
            return;
        }

        res.status(200).json({
            message: "Room type retrieved successfully.",
            room
        });
    } catch (error) {
        console.error("Error retrieving room type:", error);

        res.status(500).json({
            message: "Failed to retrieve room type."
        });
    }
};

// Update a room type (Admin only)
export const editRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const roomId = Number(req.params.id);

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.status(400).json({
                message: "Invalid room ID."
            });
            return;
        }

        const existingRoom = await findRoomById(roomId);

        if (!existingRoom) {
            res.status(404).json({
                message: "Room type not found."
            });
            return;
        }

        const {
            room_type,
            description,
            capacity,
            price_per_night,
            total_rooms
        } = req.body;

        const roomCapacity = Number(capacity);
        const roomPrice = Number(price_per_night);
        const roomQuantity = Number(total_rooms);

        if (
            typeof room_type !== "string" ||
            !room_type.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Number.isInteger(roomCapacity) ||
            roomCapacity <= 0 ||
            !Number.isFinite(roomPrice) ||
            roomPrice < 0 ||
            !Number.isInteger(roomQuantity) ||
            roomQuantity < 0
        ) {
            res.status(400).json({
                message: "Please provide valid room details."
            });
            return;
        }

        const room = await updateRoom(
            roomId,
            room_type.trim(),
            description.trim(),
            roomCapacity,
            roomPrice,
            roomQuantity
        );

        if (!room) {
            res.status(404).json({
                message: "Room type not found."
            });
            return;
        }

        res.status(200).json({
            message: "Room type updated successfully.",
            room
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(409).json({
                message: "This room type already exists for this hotel."
            });
            return;
        }

        console.error("Error updating room type:", error);

        res.status(500).json({
            message: "Failed to update room type."
        });
    }
};

// Delete a room type (Admin only)
export const removeRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const roomId = Number(req.params.id);

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.status(400).json({
                message: "Invalid room ID."
            });
            return;
        }

        const existingRoom = await findRoomById(roomId);

        if (!existingRoom) {
            res.status(404).json({
                message: "Room type not found."
            });
            return;
        }

        const deletedRoom = await deleteRoom(roomId);

        if (!deletedRoom) {
            res.status(404).json({
                message: "Room type not found."
            });
            return;
        }

        res.status(200).json({
            message: "Room type deleted successfully.",
            room: deletedRoom
        });
    } catch (error) {
        console.error("Error deleting room type:", error);

        res.status(500).json({
            message: "Failed to delete room type."
        });
    }
};



