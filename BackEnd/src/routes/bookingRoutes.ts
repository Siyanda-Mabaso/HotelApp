
import { Router } from "express";
import {
    addBooking,
    getBookings,
    getBookingById,
    removeBooking,
} from "../controllers/bookingControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// All booking routes require the user to be logged in.
router.post("/bookings", protect, addBooking);
router.get("/bookings", protect, getBookings);
router.get("/bookings/:id", protect, getBookingById);
router.delete("/bookings/:id", protect, removeBooking);

export default router;