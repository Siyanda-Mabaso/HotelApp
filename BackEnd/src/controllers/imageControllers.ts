
import { Request, Response } from "express";
import { query } from "../config/database";
import {
  addImage,
  getImagesByHotel,
  deleteImage,
} from "../services/imageServices";

export const createImage = async (req: Request, res: Response) => {
  try {
    const hotelId = Number(req.params.hotelId);
    const { image_url } = req.body;

    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    if (typeof image_url !== "string" || !image_url.trim()) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(image_url.trim());
    } catch {
      return res.status(400).json({
        message: "Please provide a valid image URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Image URL must use HTTP or HTTPS",
      });
    }

    const hotel = await query(
      "SELECT id FROM hotels WHERE id = $1",
      [hotelId]
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const image = await addImage(hotelId, parsedUrl.toString());

    return res.status(201).json({
      message: "Image added successfully",
      image,
    });
  } catch (error) {
    console.error("Error adding image:", error);
    return res.status(500).json({
      message: "Failed to add image",
    });
  }
};

export const getHotelImages = async (req: Request, res: Response) => {
  try {
    const hotelId = Number(req.params.hotelId);

    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const images = await getImagesByHotel(hotelId);

    return res.status(200).json({ images });
  } catch (error) {
    console.error("Error retrieving images:", error);
    return res.status(500).json({
      message: "Failed to retrieve images",
    });
  }
};

export const removeImage = async (req: Request, res: Response) => {
  try {
    const imageId = Number(req.params.imageId);

    if (!Number.isInteger(imageId) || imageId <= 0) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    const image = await deleteImage(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    return res.status(200).json({
      message: "Image deleted successfully",
      image,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({
      message: "Failed to delete image",
    });
  }
};
