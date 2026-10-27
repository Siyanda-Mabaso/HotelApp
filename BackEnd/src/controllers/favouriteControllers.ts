
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  addFavourite,
  findFavouritesByUserId,
  removeFavourite,
} from "../services/favouriteServices";
import { findHotelById } from "../services/hotelServices";

// Add a hotel to favourites
export const addFavouriteHotel = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const hotelId = Number(req.body.hotel_id);

    if (!userId) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }

    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      res.status(400).json({
        message: "Please provide a valid hotel ID.",
      });
      return;
    }

    const hotel = await findHotelById(hotelId);

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found." });
      return;
    }

    const favourite = await addFavourite(userId, hotelId);

    res.status(200).json({
      message: "Hotel added to favourites successfully.",
      favourite,
    });
  } catch (error) {
    console.error("Error adding favourite:", error);

    res.status(500).json({
      message: "Failed to add hotel to favourites.",
    });
  }
};

// Get the logged-in user's favourite hotels
export const getMyFavourites = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }

    const favourites = await findFavouritesByUserId(userId);

    res.status(200).json({
      message: "Favourites retrieved successfully.",
      favourites,
    });
  } catch (error) {
    console.error("Error retrieving favourites:", error);

    res.status(500).json({
      message: "Failed to retrieve favourites.",
    });
  }
};

// Remove a hotel from the logged-in user's favourites
export const deleteFavouriteHotel = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const hotelId = Number(req.params.hotelId);

    if (!userId) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }

    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      res.status(400).json({
        message: "Please provide a valid hotel ID.",
      });
      return;
    }

    const favourite = await removeFavourite(userId, hotelId);

    if (!favourite) {
      res.status(404).json({
        message: "This hotel is not in your favourites.",
      });
      return;
    }

    res.status(200).json({
      message: "Hotel removed from favourites successfully.",
    });
  } catch (error) {
    console.error("Error removing favourite:", error);

    res.status(500).json({
      message: "Failed to remove hotel from favourites.",
    });
  }
};
