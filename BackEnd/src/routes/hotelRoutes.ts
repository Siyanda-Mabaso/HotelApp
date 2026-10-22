import { Router } from "express";

import {
    addHotel,
    getAllHotels,
    getHotelById,
    editHotel,
    removeHotel,
} from "../controllers/hotelControllers";

import {
    protect,
    adminOnly,
} from "../middleware/authMiddleware";

const router = Router();

// Public routes: anyone can view hotels
router.get("/hotels", getAllHotels);
router.get("/hotels/:id", getHotelById);

// Protected routes: only admins can manage hotels
router.post("/hotels", protect, adminOnly, addHotel);
router.put("/hotels/:id", protect, adminOnly, editHotel);
router.delete("/hotels/:id", protect, adminOnly, removeHotel);

export default router;

