import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createReview, findReviewsByHotelId, findReviewsByUserId, updateReview, deleteReview } from "../services/reviewServices";
import { findHotelById } from "../services/hotelServices";

// 1. ADD REVIEW
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const hotelId = Number(req.body.hotel_id);
        const rating = Number(req.body.rating);
        const comment = req.body.comment;

        if (!userId) { res.status(401).json({ message: "Please log in first." }); return; }
        if (!Number.isInteger(hotelId) || hotelId <= 0 || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== "string" || !comment.trim()) {
            res.status(400).json({ message: "Provide a valid hotel_id, a rating from 1 to 5, and a comment." }); return;
        }

        const hotel = await findHotelById(hotelId);
        if (!hotel) { res.status(404).json({ message: "Hotel not found." }); return; }

        const review = await createReview(userId, hotelId, rating, comment.trim());
        res.status(201).json({ message: "Review added successfully.", review });
    } catch (error: any) {
        if (error.code === "23505") { res.status(409).json({ message: "You have already reviewed this hotel." }); return; }
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Failed to add review." });
    }
};

// 2. GET HOTEL REVIEWS
export const getHotelReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const hotelId = Number(req.params.hotelId);
        if (!Number.isInteger(hotelId) || hotelId <= 0) { res.status(400).json({ message: "Invalid hotel ID." }); return; }

        const hotel = await findHotelById(hotelId);
        if (!hotel) { res.status(404).json({ message: "Hotel not found." }); return; }

        const reviews = await findReviewsByHotelId(hotelId);
        res.status(200).json({ message: "Hotel reviews retrieved successfully.", reviews });
    } catch (error) {
        console.error("Error retrieving hotel reviews:", error);
        res.status(500).json({ message: "Failed to retrieve reviews." });
    }
};

// 3. GET MY REVIEWS
export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ message: "Please log in first." }); return; }

        const reviews = await findReviewsByUserId(userId);
        res.status(200).json({ message: "Your reviews retrieved successfully.", reviews });
    } catch (error) {
        console.error("Error retrieving your reviews:", error);
        res.status(500).json({ message: "Failed to retrieve your reviews." });
    }
};

// 4. EDIT REVIEW
export const editReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const reviewId = Number(req.params.id);
        const rating = Number(req.body.rating);
        const comment = req.body.comment;

        if (!userId) { res.status(401).json({ message: "Please log in first." }); return; }
        if (!Number.isInteger(reviewId) || reviewId <= 0 || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== "string" || !comment.trim()) {
            res.status(400).json({ message: "Provide a valid review ID, a rating from 1 to 5, and a comment." }); return;
        }

        const review = await updateReview(reviewId, userId, rating, comment.trim());
        if (!review) { res.status(404).json({ message: "Review not found or you are not allowed to edit it." }); return; }
        res.status(200).json({ message: "Review updated successfully.", review });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Failed to update review." });
    }
};

// 5. REMOVE REVIEW
export const removeReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const reviewId = Number(req.params.id);

        if (!userId) { res.status(401).json({ message: "Please log in first." }); return; }
        if (!Number.isInteger(reviewId) || reviewId <= 0) { res.status(400).json({ message: "Invalid review ID." }); return; }

        const review = await deleteReview(reviewId, userId);
        if (!review) { res.status(404).json({ message: "Review not found or you are not allowed to delete it." }); return; }
        res.status(200).json({ message: "Review deleted successfully.", review });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Failed to delete review." });
    }
};
