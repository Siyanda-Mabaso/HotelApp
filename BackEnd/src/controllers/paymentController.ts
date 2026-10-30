import { Response } from "express";
import { randomUUID } from "crypto";

import { AuthRequest } from "../middleware/authMiddleware";

import {
  findBookingById,
  saveBookingPaymentReference,
  clearBookingPaymentReference,
  confirmBookingPayment,
} from "../services/bookingServices";

import { findUserById } from "../services/userServices";

import { initializePayment, verifyPayment } from "../services/paymentServices";

// Initialize payment for an existing booking
export const initializeBookingPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  let bookingId = 0;
  let userId = 0;
  let reference = "";

  try {
    userId = Number(req.user?.userId);
    bookingId = Number(req.body.bookingId);

    if (!userId) {
      res.status(401).json({
        message: "Please log in to make a payment.",
      });
      return;
    }

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      res.status(400).json({
        message: "A valid booking ID is required.",
      });
      return;
    }

    // Find the customer
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    // Find the booking
    const booking = await findBookingById(bookingId);

    if (!booking) {
      res.status(404).json({
        message: "Booking not found.",
      });
      return;
    }

    // Ensure the booking belongs to the logged-in customer
    if (booking.user_id !== userId) {
      res.status(403).json({
        message: "You cannot pay for this booking.",
      });
      return;
    }

    if (booking.status !== "pending") {
      res.status(400).json({
        message: "Only pending bookings can be paid for.",
      });
      return;
    }

    if (booking.payment_reference) {
      res.status(409).json({
        message: "A payment has already been initialized for this booking.",
      });
      return;
    }

    const amount = Number(booking.total_price);

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({
        message: "Invalid booking payment amount.",
      });
      return;
    }

    // Generate a unique Paystack reference
    reference = `PARADISE-${booking.id}-${randomUUID()}`;

    // Save the reference before contacting Paystack
    const updatedBooking = await saveBookingPaymentReference(
      bookingId,
      userId,
      reference,
    );

    if (!updatedBooking) {
      res.status(409).json({
        message:
          "Unable to initialize payment for this booking. Please try again.",
      });
      return;
    }

    try {
      // Initialize Paystack using the customer's database email
      const payment = await initializePayment(user.email, amount, reference);

      if (!payment.status || !payment.data?.authorization_url) {
        throw new Error("Paystack did not return a payment URL.");
      }

      res.status(200).json({
        message: "Payment initialized successfully.",
        authorization_url: payment.data.authorization_url,
        reference: payment.data.reference,
        booking_id: booking.id,
        amount,
      });
    } catch (paymentError) {
      // Allow the customer to retry if initialization fails
      await clearBookingPaymentReference(bookingId, userId, reference);

      throw paymentError;
    }
  } catch (error) {
    console.error("Initialize payment error:", error);

    res.status(500).json({
      message: "Unable to initialize payment. Please try again.",
    });
  }
};

// Verify Paystack payment
export const verifyBookingPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = Number(req.user?.userId);
    const bookingId = Number(req.body.bookingId);
    const reference = String(req.body.reference || "").trim();

    if (!userId) {
      res.status(401).json({
        message: "Please log in to verify payment.",
      });
      return;
    }

    if (!Number.isInteger(bookingId) || bookingId <= 0 || !reference) {
      res.status(400).json({
        message: "A valid booking ID and payment reference are required.",
      });
      return;
    }

    // Find the booking
    const booking = await findBookingById(bookingId);

    if (!booking) {
      res.status(404).json({
        message: "Booking not found.",
      });
      return;
    }

    // Ensure the booking belongs to the logged-in customer
    if (booking.user_id !== userId) {
      res.status(403).json({
        message: "You cannot verify this booking's payment.",
      });
      return;
    }

    // Ensure the reference belongs to this booking
    if (booking.payment_reference !== reference) {
      res.status(400).json({
        message: "Payment reference does not match this booking.",
      });
      return;
    }

    // Check Paystack directly
    const payment = await verifyPayment(reference);

    if (!payment.status || !payment.data) {
      res.status(400).json({
        message: "Unable to verify payment with Paystack.",
      });
      return;
    }

    const transaction = payment.data;

    // Check transaction reference
    if (transaction.reference !== reference) {
      res.status(400).json({
        message: "Transaction reference does not match.",
      });
      return;
    }

    // Check transaction status
    if (transaction.status !== "success") {
      res.status(400).json({
        message: "Payment has not been completed successfully.",
        payment_status: transaction.status,
      });
      return;
    }

    // Check currency
    if (transaction.currency !== "ZAR") {
      res.status(400).json({
        message: "Payment currency does not match.",
      });
      return;
    }

    // Check amount against the saved booking amount
    const expectedAmount = Math.round(Number(booking.total_price) * 100);

    if (Number(transaction.amount) !== expectedAmount) {
      res.status(400).json({
        message: "Payment amount does not match the booking total.",
      });
      return;
    }

    // Make verification idempotent
    if (booking.status === "confirmed") {
      res.status(200).json({
        message: "This booking has already been confirmed.",
        booking,
      });
      return;
    }

    if (booking.status !== "pending") {
      res.status(400).json({
        message: "This booking cannot be confirmed.",
      });
      return;
    }

    // Confirm the booking only after successful verification
    const confirmedBooking = await confirmBookingPayment(
      bookingId,
      userId,
      reference,
    );

    if (!confirmedBooking) {
      res.status(409).json({
        message:
          "Unable to confirm booking. Please refresh and check its status.",
      });
      return;
    }

    res.status(200).json({
      message: "Payment verified successfully. Your booking is confirmed.",
      booking: confirmedBooking,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    res.status(500).json({
      message: "Unable to verify payment. Please try again.",
    });
  }
};
