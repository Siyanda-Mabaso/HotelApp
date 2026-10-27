import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../Store/store";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import styles from "./MyBookings.module.css";

interface Booking {
  id: number;
  user_id: number;
  hotel_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  rooms: number;
  guests: number;
  total_price: number | string;
  status: string;
  created_at: string;
  hotel_name?: string;
  room_type?: string;
  hotel_city?: string;
  hotel_country?: string;
}

const MyBookings = () => {
  const token = useSelector((state: RootState) => state.login.token);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setError("Please log in to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.bookings ?? response.data;
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setError("Unable to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const handleCancel = async (bookingId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed || !token) return;

    setError("");
    setMessage("");

    try {
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );

      setMessage("Booking cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setError("Unable to cancel this booking. Please try again.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatPrice = (price: number | string) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "Price unavailable";

    return `R${amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.heading}>
          <p className={styles.eyebrow}>YOUR PARADISE JOURNEY</p>
          <h1>My Bookings</h1>
          <p>View and manage your hotel reservations.</p>
        </section>

        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className={styles.info}>Loading your bookings...</p>
        ) : bookings.length === 0 && !error ? (
          <section className={styles.empty}>
            <h2>No bookings yet</h2>
            <p>Your reservations will appear here after booking a stay.</p>
            <Link to="/home" className={styles.primaryButton}>
              Explore hotels
            </Link>
          </section>
        ) : (
          <section className={styles.bookingList}>
            {bookings.map((booking) => (
              <article className={styles.card} key={booking.id}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.bookingNumber}>
                      BOOKING #{booking.id}
                    </p>

                    <h2>
                      {booking.hotel_name || `Hotel #${booking.hotel_id}`}
                    </h2>

                    <p className={styles.location}>
                      {[booking.hotel_city, booking.hotel_country]
                        .filter(Boolean)
                        .join(", ") || "Location unavailable"}
                    </p>

                    <p className={styles.roomType}>
                      {booking.room_type || `Room #${booking.room_id}`}
                    </p>
                  </div>

                  <span
                    className={`${styles.status} ${
                      booking.status?.toLowerCase() === "cancelled"
                        ? styles.cancelled
                        : styles.active
                    }`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <div className={styles.details}>
                  <div>
                    <span>CHECK-IN</span>
                    <strong>{formatDate(booking.check_in)}</strong>
                  </div>

                  <div>
                    <span>CHECK-OUT</span>
                    <strong>{formatDate(booking.check_out)}</strong>
                  </div>

                  <div>
                    <span>ROOMS</span>
                    <strong>{booking.rooms}</strong>
                  </div>

                  <div>
                    <span>GUESTS</span>
                    <strong>{booking.guests}</strong>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div>
                    <span className={styles.totalLabel}>Total price</span>
                    <strong className={styles.price}>
                      {formatPrice(booking.total_price)}
                    </strong>
                  </div>

                  {booking.status?.toLowerCase() !== "cancelled" && (
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default MyBookings;