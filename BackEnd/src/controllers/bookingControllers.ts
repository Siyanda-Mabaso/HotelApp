
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
    createBooking,
    findAllBookings,
    findBookingsByUserId,
    findBookingById,
    cancelBooking,
} from "../services/bookingServices";
import { findHotelById } from "../services/hotelServices";

// Create a booking
export const addBooking = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { hotel_id, check_in, check_out, rooms, guests } = req.body;

        if (!userId) {
            res.status(401).json({ message: "Please log in first." });
            return;
        }

        if (!hotel_id || !check_in || !check_out || !rooms || !guests) {
            res.status(400).json({
                message: "Please provide the hotel, dates, rooms, and guests.",
            });
            return;
        }

        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);

        if (
            Number.isNaN(checkInDate.getTime()) ||
            Number.isNaN(checkOutDate.getTime()) ||
            checkOutDate <= checkInDate
        ) {
            res.status(400).json({
                message: "Check-out must be after check-in. Please provide valid dates.",
            });
            return;
        }

        if (
            !Number.isInteger(Number(rooms)) ||
            Number(rooms) <= 0 ||
            !Number.isInteger(Number(guests)) ||
            Number(guests) <= 0
        ) {
            res.status(400).json({
                message: "Rooms and guests must be positive whole numbers.",
            });
            return;
        }

        const hotel = await findHotelById(Number(hotel_id));

        if (!hotel) {
            res.status(404).json({ message: "Hotel not found." });
            return;
        }

        // Calculate the price on the server.
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil(
            (Date.UTC(
                checkOutDate.getUTCFullYear(),
                checkOutDate.getUTCMonth(),
                checkOutDate.getUTCDate()
            ) -
                Date.UTC(
                    checkInDate.getUTCFullYear(),
                    checkInDate.getUTCMonth(),
                    checkInDate.getUTCDate()
                )) /
                millisecondsPerDay
        );

        const totalPrice =
            Number(hotel.price_per_night) * nights * Number(rooms);

        const booking = await createBooking(
            userId,
            Number(hotel_id),
            check_in,
            check_out,
            Number(rooms),
            Number(guests),
            totalPrice
        );

        res.status(201).json({
            message: "Booking created successfully.",
            booking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking." });
    }
};

// Get bookings
export const getBookings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Please log in first." });
            return;
        }

        // Admins can see all bookings; customers see only their own.
        const bookings =
            req.user.role === "admin"
                ? await findAllBookings()
                : await findBookingsByUserId(req.user.userId);

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ message: "Failed to retrieve bookings." });
    }
};

// Get one booking
export const getBookingById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;
        const bookingId = Number(req.params.id);

        if (!user) {
            res.status(401).json({ message: "Please log in first." });
            return;
        }

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            res.status(400).json({ message: "Invalid booking ID." });
            return;
        }

        const booking = await findBookingById(bookingId);

        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }

        if (user.role !== "admin" && booking.user_id !== user.userId) {
            res.status(403).json({
                message: "You can only view your own bookings.",
            });
            return;
        }

        res.status(200).json({ booking });
    } catch (error) {
        console.error("Error retrieving booking:", error);
        res.status(500).json({ message: "Failed to retrieve booking." });
    }
};

// Cancel your own booking (admins can also cancel)
export const removeBooking = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;
        const bookingId = Number(req.params.id);

        if (!user) {
            res.status(401).json({ message: "Please log in first." });
            return;
        }

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            res.status(400).json({ message: "Invalid booking ID." });
            return;
        }

        const existingBooking = await findBookingById(bookingId);

        if (!existingBooking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }

        if (
            user.role !== "admin" &&
            existingBooking.user_id !== user.userId
        ) {
            res.status(403).json({
                message: "You can only cancel your own bookings.",
            });
            return;
        }

        const booking = await cancelBooking(
            bookingId,
            existingBooking.user_id
        );

        if (!booking) {
            res.status(400).json({
                message: "Booking is already cancelled.",
            });
            return;
        }

        res.status(200).json({
            message: "Booking cancelled successfully.",
            booking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Failed to cancel booking." });
    }
};