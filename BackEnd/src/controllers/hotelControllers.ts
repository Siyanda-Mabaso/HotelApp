
import { Request, Response } from "express";
import {
    createHotel,
    findAllHotels,
    findHotelById,
    updateHotel,
    deleteHotel
} from "../services/hotelServices";

// Add a new hotel
export const addHotel = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            name,
            description,
            address,
            city,
            country,
            star_rating,
            price_per_night,
            facilities
        } = req.body;

        if (
            !name ||
            !description ||
            !address ||
            !city ||
            !country ||
            price_per_night === undefined ||
            price_per_night === null
        ) {
            res.status(400).json({
                message: "Please provide all required hotel details"
            });
            return;
        }

        if (
            facilities !== undefined &&
            (!Array.isArray(facilities) ||
                !facilities.every(
                    (facility: unknown) =>
                        typeof facility === "string"
                ))
        ) {
            res.status(400).json({
                message: "Facilities must be a list of text values"
            });
            return;
        }

        const hotel = await createHotel(
            name,
            description,
            address,
            city,
            country,
            star_rating ?? null,
            Number(price_per_night),
            facilities ?? []
        );

        res.status(201).json({
            message: "Hotel added successfully",
            hotel
        });
    } catch (error) {
        console.error("Add hotel error:", error);

        res.status(500).json({
            message: "Failed to add hotel"
        });
    }
};

// Get all hotels
export const getAllHotels = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const hotels = await findAllHotels();

        res.status(200).json({
            message: "Hotels retrieved successfully",
            hotels
        });
    } catch (error) {
        console.error("Get hotels error:", error);

        res.status(500).json({
            message: "Failed to retrieve hotels"
        });
    }
};

// Get a hotel by ID
export const getHotelById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid hotel ID"
            });
            return;
        }

        const hotel = await findHotelById(id);

        if (!hotel) {
            res.status(404).json({
                message: "Hotel not found"
            });
            return;
        }

        res.status(200).json({
            message: "Hotel retrieved successfully",
            hotel
        });
    } catch (error) {
        console.error("Get hotel error:", error);

        res.status(500).json({
            message: "Failed to retrieve hotel"
        });
    }
};

// Update a hotel
export const editHotel = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid hotel ID"
            });
            return;
        }

        const {
            name,
            description,
            address,
            city,
            country,
            star_rating,
            price_per_night,
            facilities
        } = req.body;

        if (
            !name ||
            !description ||
            !address ||
            !city ||
            !country ||
            price_per_night === undefined ||
            price_per_night === null
        ) {
            res.status(400).json({
                message: "Please provide all required hotel details"
            });
            return;
        }

        if (
            facilities !== undefined &&
            (!Array.isArray(facilities) ||
                !facilities.every(
                    (facility: unknown) =>
                        typeof facility === "string"
                ))
        ) {
            res.status(400).json({
                message: "Facilities must be a list of text values"
            });
            return;
        }

        const hotel = await updateHotel(
            id,
            name,
            description,
            address,
            city,
            country,
            star_rating ?? null,
            Number(price_per_night),
            facilities
        );

        if (!hotel) {
            res.status(404).json({
                message: "Hotel not found"
            });
            return;
        }

        res.status(200).json({
            message: "Hotel updated successfully",
            hotel
        });
    } catch (error) {
        console.error("Update hotel error:", error);

        res.status(500).json({
            message: "Failed to update hotel"
        });
    }
};

// Delete a hotel
export const removeHotel = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid hotel ID"
            });
            return;
        }

        const deleted = await deleteHotel(id);

        if (!deleted) {
            res.status(404).json({
                message: "Hotel not found"
            });
            return;
        }

        res.status(200).json({
            message: "Hotel deleted successfully"
        });
    } catch (error) {
        console.error("Delete hotel error:", error);

        res.status(500).json({
            message: "Failed to delete hotel"
        });
    }
};
