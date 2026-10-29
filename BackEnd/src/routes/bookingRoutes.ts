
import { Router } from "express";

import {
  addBooking,
  getBookings,
  getBookingById,
  removeBooking,
  getAdminBookings,
  deleteBooking,
} from "../controllers/bookingControllers";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware";

const router = Router();

// Create a booking
router.post("/bookings", protect, addBooking);

// Customer: own bookings; admin: all bookings
router.get("/bookings", protect, getBookings);

// Admin-only booking management
router.get(
  "/bookings/admin",
  protect,
  adminOnly,
  getAdminBookings,
);

router.delete(
  "/bookings/admin/:id",
  protect,
  adminOnly,
  deleteBooking,
);

// View one booking
router.get("/bookings/:id", protect, getBookingById);

// Cancel a booking (existing behavior)
router.delete("/bookings/:id", protect, removeBooking);

export default router;
