import { Router } from "express";
import {
    addRoom,
    getRoomsByHotel,
    getRoomById,
    editRoom,
    removeRoom
} from "../controllers/roomControllers";

import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

// Admin only: Add a room type
router.post("/rooms", protect, adminOnly, addRoom);

// Public: Get all room types for a hotel
router.get("/hotels/:hotelId/rooms", getRoomsByHotel);

// Public: Get one room type
router.get("/rooms/:id", getRoomById);

// Admin only: Update a room type
router.put("/rooms/:id", protect, adminOnly, editRoom);

// Admin only: Delete a room type
router.delete("/rooms/:id", protect, adminOnly, removeRoom);

export default router;

