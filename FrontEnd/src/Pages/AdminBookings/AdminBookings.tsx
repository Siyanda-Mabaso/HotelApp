
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../Store/store";
import styles from "./AdminBookings.module.css";
import {
  clearBookingError,
  clearBookingSuccess,
  deleteAdminBooking,
  fetchAdminBookings,
} from "../../ReduxSlice/bookingSlice";

const AdminBookings = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    bookings,
    isLoading,
    isSaving,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchAdminBookings());
  }, [dispatch]);

  const handleDelete = (bookingId: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete booking #${bookingId}? This action cannot be undone. The customer account will not be deleted.`,
    );

    if (confirmed) {
      dispatch(deleteAdminBooking(bookingId));
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    const [year, month, day] = date.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(Number(price));

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return styles["booking-status-confirmed"];
      case "cancelled":
        return styles["booking-status-cancelled"];
      default:
        return styles["booking-status-pending"];
    }
  };

  return (
    <main className={styles["admin-bookings-page"]}>
      <section className={styles["admin-bookings-header"]}>
        <div className={styles["header-content"]}>
          <span className={styles["page-eyebrow"]}>
            PARADISE MANAGEMENT
          </span>
          <h1>Manage Bookings</h1>
          <p>
            View customer reservations and manage individual bookings.
          </p>
        </div>

        
      </section>

      {error && (
        <div
          className={`${styles["booking-alert"]} ${styles["booking-alert-error"]}`}
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => dispatch(clearBookingError())}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className={`${styles["booking-alert"]} ${styles["booking-alert-success"]}`}
          role="status"
        >
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => dispatch(clearBookingSuccess())}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      

      <section className={styles["booking-content"]}>
        <div className={styles["booking-section-heading"]}>
          <div>
            <h2>Customer Reservations</h2>
            <p>Review booking details, dates, and payment totals.</p>
          </div>
          <span className={styles["booking-count"]}>
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        </div>

        {isLoading && bookings.length === 0 ? (
          <div className={styles["booking-empty"]}>
            <p>Loading reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className={styles["booking-empty"]}>
            <div className={styles["empty-icon"]} aria-hidden="true">
              ▤
            </div>
            <h3>No bookings found</h3>
            <p>Customer reservations will appear here when they book a stay.</p>
            <button
              type="button"
              className={styles["refresh-button"]}
              onClick={() => dispatch(fetchAdminBookings())}
            >
              Refresh Bookings
            </button>
          </div>
        ) : (
          <div className={styles["booking-table-wrapper"]}>
            <table className={styles["booking-table"]}>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Accommodation</th>
                  <th>Room Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Rooms</th>
                  <th>Guests</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className={styles["booking-id"]}>
                        #{booking.id}
                      </span>
                    </td>

                    <td>
                      <div className={styles["table-primary"]}>
                        {booking.customer_name || "Unknown customer"}
                      </div>
                      <div className={styles["table-secondary"]}>
                        {booking.customer_email || "No email available"}
                      </div>
                    </td>

                    <td>
                      <div className={styles["table-primary"]}>
                        {booking.hotel_name || `Hotel #${booking.hotel_id}`}
                      </div>
                      <div className={styles["table-secondary"]}>
                        {[booking.hotel_city, booking.hotel_country]
                          .filter(Boolean)
                          .join(", ") || "Location unavailable"}
                      </div>
                    </td>

                    <td>{booking.room_type || "—"}</td>
                    <td>{formatDate(booking.check_in)}</td>
                    <td>{formatDate(booking.check_out)}</td>
                    <td>{booking.rooms}</td>
                    <td>{booking.guests}</td>

                    <td className={styles["booking-price"]}>
                      {formatPrice(booking.total_price)}
                    </td>

                    <td>
                      <span
                        className={`${styles["booking-status"]} ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        <span className={styles["status-dot"]} />
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles["booking-delete-button"]}
                        onClick={() => handleDelete(booking.id)}
                        disabled={isSaving}
                        aria-label={`Delete booking ${booking.id}`}
                        title="Permanently delete this booking"
                      >
                        <span aria-hidden="true">⌫</span>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    
    </main>
  );
};

export default AdminBookings;
