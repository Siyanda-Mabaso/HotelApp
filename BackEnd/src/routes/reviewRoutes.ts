
import { Router } from "express";
import {
    addReview,
    getHotelReviews,
    getMyReviews,
    editReview,
    removeReview,
} from "../controllers/reviewControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Add a review
router.post("/reviews", protect, addReview);

// View reviews for a specific hotel
router.get("/hotels/:hotelId/reviews", getHotelReviews);

// View your own reviews
router.get("/my-reviews", protect, getMyReviews);

// Update your own review
router.put("/reviews/:id", protect, editReview);

// Delete your own review
router.delete("/reviews/:id", protect, removeReview);

export default router;
