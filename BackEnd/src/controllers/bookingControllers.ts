import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

import {
  createBooking,
  findAllBookings,
  findBookingsByUserId,
  findBookingById,
  cancelBooking,
  countBookedRooms,
} from "../services/bookingServices";

import { findHotelById } from "../services/hotelServices";
import { findRoomById, findRoomsByHotelId } from "../services/roomServices";

// Create a booking
export const addBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const { hotel_id, room_id, check_in, check_out, rooms, guests } = req.body;

    if (!userId) {
      res.status(401).json({
        message: "Please log in first.",
      });
      return;
    }

    // Validate required fields
    if (
      hotel_id === undefined ||
      room_id === undefined ||
      !check_in ||
      !check_out ||
      rooms === undefined ||
      guests === undefined
    ) {
      res.status(400).json({
        message:
          "Please provide the hotel, room type, dates, rooms, and guests.",
      });
      return;
    }

    const hotelId = Number(hotel_id);
    const roomId = Number(room_id);
    const roomQuantity = Number(rooms);
    const guestQuantity = Number(guests);

    if (
      !Number.isInteger(hotelId) ||
      hotelId <= 0 ||
      !Number.isInteger(roomId) ||
      roomId <= 0
    ) {
      res.status(400).json({
        message: "Please provide valid hotel and room IDs.",
      });
      return;
    }

    if (
      !Number.isInteger(roomQuantity) ||
      roomQuantity <= 0 ||
      !Number.isInteger(guestQuantity) ||
      guestQuantity <= 0
    ) {
      res.status(400).json({
        message: "Rooms and guests must be positive whole numbers.",
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    const isValidDate = (value: unknown): boolean => {
      if (typeof value !== "string" || !datePattern.test(value)) {
        return false;
      }

      const parsed = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
      );
    };

    if (!isValidDate(check_in) || !isValidDate(check_out)) {
      res.status(400).json({
        message: "Dates must be valid and use YYYY-MM-DD format.",
      });
      return;
    }

    if (check_out <= check_in) {
      res.status(400).json({
        message: "Check-out must be after check-in.",
      });
      return;
    }

    // Check that the hotel exists
    const hotel = await findHotelById(hotelId);

    if (!hotel) {
      res.status(404).json({
        message: "Hotel not found.",
      });
      return;
    }

    // Check that the selected room exists
    const room = await findRoomById(roomId);

    if (!room) {
      res.status(404).json({
        message: "Room type not found.",
      });
      return;
    }

    // Ensure the selected room belongs to this hotel
    if (room.hotel_id !== hotelId) {
      res.status(400).json({
        message: "The selected room does not belong to this hotel.",
      });
      return;
    }

    // Check guest capacity across the requested rooms
    if (guestQuantity > room.capacity * roomQuantity) {
      res.status(400).json({
        message:
          `This room type accommodates up to ${room.capacity} guests per room. ` +
          `For ${guestQuantity} guests, please select more rooms.`,
      });
      return;
    }

    // Calculate the number of nights using UTC dates
    const checkInDate = new Date(`${check_in}T00:00:00.000Z`);
    const checkOutDate = new Date(`${check_out}T00:00:00.000Z`);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay;

    if (!Number.isInteger(nights) || nights <= 0) {
      res.status(400).json({
        message: "Please provide a valid booking duration.",
      });
      return;
    }

    // Count rooms reserved during overlapping dates
    const bookedRooms = await countBookedRooms(roomId, check_in, check_out);

    const availableRooms = room.total_rooms - bookedRooms;

    if (availableRooms < roomQuantity) {
      res.status(409).json({
        message: "Not enough rooms are available for those dates.",
        available_rooms: Math.max(0, availableRooms),
      });
      return;
    }

    // Calculate the price using the selected room's nightly rate
    const nightlyPrice = Number(room.price_per_night);
    const totalPrice = nightlyPrice * nights * roomQuantity;

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      res.status(400).json({
        message: "Unable to calculate the booking price.",
      });
      return;
    }

    // Create the booking
    const booking = await createBooking(
      userId,
      hotelId,
      check_in,
      check_out,
      roomQuantity,
      guestQuantity,
      Number(totalPrice.toFixed(2)),
      roomId,
    );

    res.status(201).json({
      message: "Booking created successfully.",
      booking,
      price_summary: {
        room_type: room.room_type,
        price_per_night: nightlyPrice,
        nights,
        rooms: roomQuantity,
        total_price: Number(totalPrice.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    res.status(500).json({
      message: "Failed to create booking.",
    });
  }
};

// Get bookings
export const getBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Please log in first.",
      });
      return;
    }

    // Admins can see all bookings; customers see only their own
    const bookings =
      req.user.role === "admin"
        ? await findAllBookings()
        : await findBookingsByUserId(req.user.userId);

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error retrieving bookings:", error);

    res.status(500).json({
      message: "Failed to retrieve bookings.",
    });
  }
};

// Get one booking
export const getBookingById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const bookingId = Number(req.params.id);

    if (!user) {
      res.status(401).json({
        message: "Please log in first.",
      });
      return;
    }

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      res.status(400).json({
        message: "Invalid booking ID.",
      });
      return;
    }

    const booking = await findBookingById(bookingId);

    if (!booking) {
      res.status(404).json({
        message: "Booking not found.",
      });
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

    res.status(500).json({
      message: "Failed to retrieve booking.",
    });
  }
};

// Cancel your own booking (admins can also cancel)
export const removeBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const bookingId = Number(req.params.id);

    if (!user) {
      res.status(401).json({
        message: "Please log in first.",
      });
      return;
    }

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      res.status(400).json({
        message: "Invalid booking ID.",
      });
      return;
    }

    const existingBooking = await findBookingById(bookingId);

    if (!existingBooking) {
      res.status(404).json({
        message: "Booking not found.",
      });
      return;
    }

    if (user.role !== "admin" && existingBooking.user_id !== user.userId) {
      res.status(403).json({
        message: "You can only cancel your own bookings.",
      });
      return;
    }

    const booking = await cancelBooking(bookingId, existingBooking.user_id);

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

    res.status(500).json({
      message: "Failed to cancel booking.",
    });
  }
};
