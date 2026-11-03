import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";
import {
  verifyBookingPayment,
  type Booking,
} from "../../ReduxSlice/bookingSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./PaymentCallback.module.css";

const PaymentCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useSelector((state: RootState) => state.login.token);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  // Prevent duplicate verification when React runs effects again.
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;

    const reference = searchParams.get("reference");

    if (!reference) {
      setError("Payment reference was not found.");
      setIsVerifying(false);
      return;
    }

    if (!token) {
      setError("Please log in again to verify your payment.");
      setIsVerifying(false);
      return;
    }

    // Our backend generates references in this format:
    // PARADISE-6-unique-reference
    const match = reference.match(/^PARADISE-(\d+)-/);

    if (!match) {
      setError("Invalid payment reference.");
      setIsVerifying(false);
      return;
    }

    const bookingId = Number(match[1]);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      setError("Invalid booking ID.");
      setIsVerifying(false);
      return;
    }

    verificationStarted.current = true;

    const verifyPayment = async () => {
      try {
       const verifiedBooking = await dispatch(
  verifyBookingPayment({ bookingId, reference })
).unwrap();

setBooking(verifiedBooking);

// Redirect to My Bookings after successful verification
navigate("/my-bookings", { replace: true });
      } catch (err) {
        setError(
          typeof err === "string"
            ? err
            : "We could not verify your payment. Please contact support.",
        );
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyPayment();
  }, [dispatch, searchParams, token]);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.container}>
          {isVerifying ? (
            <>
              <div className={styles.icon}>⏳</div>
              <h1>Verifying your payment</h1>
              <p>
                Please wait while we confirm your transaction with Paystack. Do
                not close this page.
              </p>
            </>
          ) : booking ? (
            <>
              <div className={styles.successIcon}>✓</div>

              <h1>Payment successful!</h1>

              <p>
                Your payment has been verified and your Paradise booking is
                confirmed.
              </p>

              <div className={styles.bookingDetails}>
                <h2>Booking details</h2>

                <p>
                  Booking ID: <strong>#{booking.id}</strong>
                </p>

                <p>
                  Check-in:{" "}
                  <strong>
                    {new Date(booking.check_in).toLocaleDateString()}
                  </strong>
                </p>

                <p>
                  Check-out:{" "}
                  <strong>
                    {new Date(booking.check_out).toLocaleDateString()}
                  </strong>
                </p>

                <p>
                  Total paid:{" "}
                  <strong>
                    R
                    {Number(booking.total_price).toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </p>

                <p>
                  Status: <strong>Confirmed</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className={styles.button}
              >
                View my bookings
              </button>
            </>
          ) : (
            <>
              <div className={styles.errorIcon}>!</div>

              <h1>Payment verification failed</h1>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className={styles.button}
              >
                Return to hotels
              </button>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PaymentCallback;
