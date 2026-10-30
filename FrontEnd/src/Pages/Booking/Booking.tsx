
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";

import { fetchHotelById } from "../../ReduxSlice/hotelSlice";
import { fetchRoomsByHotel, type Room } from "../../ReduxSlice/roomSlice";

import {
  createBooking,
  initializeBookingPayment,
  clearBookingError,
  clearBookingSuccess,
} from "../../ReduxSlice/bookingSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./Booking.module.css";

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.login.token);

  const { hotels, selectedHotel, isHotelLoading, hotelError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const {
    rooms: roomsList,
    isLoading: roomsLoading,
    error: roomsError,
  } = useSelector((state: RootState) => state.rooms);

  const {
    selectedBooking,
    isSaving,
    error: bookingError,
  } = useSelector((state: RootState) => state.bookings);

  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [formError, setFormError] = useState("");

  const hotelId = Number(id);
  const validHotelId = Boolean(id) && Number.isInteger(hotelId) && hotelId > 0;

  const hotel =
    selectedHotel && Number(selectedHotel.id) === hotelId
      ? selectedHotel
      : (hotels.find((item) => Number(item.id) === hotelId) ?? null);

  useEffect(() => {
    if (!validHotelId) return;

    void dispatch(fetchHotelById(String(hotelId)));
    void dispatch(fetchRoomsByHotel(hotelId));
  }, [dispatch, hotelId, validHotelId]);

  useEffect(() => {
    return () => {
      dispatch(clearBookingError());
      dispatch(clearBookingSuccess());
    };
  }, [dispatch]);

  // Keep only rooms belonging to the selected hotel.
  const displayedRooms = roomsList.filter(
    (room: Room) => Number(room.hotel_id) === hotelId,
  );

  const selectedRoom = displayedRooms.find(
    (room) => Number(room.id) === Number(roomId),
  );

  const today = new Date().toLocaleDateString("en-CA");

  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? Math.round(
          (new Date(`${checkOut}T00:00:00`).getTime() -
            new Date(`${checkIn}T00:00:00`).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const nightlyPrice = selectedRoom
    ? Number(selectedRoom.price_per_night)
    : 0;

  const totalPrice = nights * rooms * nightlyPrice;

  const formatPrice = (price: number) =>
    `R${price.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleBooking = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    dispatch(clearBookingError());
    dispatch(clearBookingSuccess());

    if (!token) {
      navigate("/login");
      return;
    }

    if (!validHotelId || !selectedRoom) {
      setFormError("Please select a valid room type.");
      return;
    }

    if (!checkIn || !checkOut) {
      setFormError("Please select your check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setFormError("Check-in cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setFormError("Check-out must be after check-in.");
      return;
    }

    if (!Number.isInteger(rooms) || rooms < 1) {
      setFormError("Please select at least one room.");
      return;
    }

    if (rooms > Number(selectedRoom.total_rooms)) {
      setFormError(
        `This room type has ${selectedRoom.total_rooms} room(s) available to allocate.`,
      );
      return;
    }

    if (!Number.isInteger(guests) || guests < 1) {
      setFormError("Please enter at least one guest.");
      return;
    }

    if (guests > Number(selectedRoom.capacity) * rooms) {
      setFormError(
        `This selection accommodates up to ${
          Number(selectedRoom.capacity) * rooms
        } guest(s). Please select more rooms.`,
      );
      return;
    }

    try {
      // Reuse an existing matching pending booking if payment
      // initialization previously failed. This avoids duplicate bookings.
      const existingBooking =
        selectedBooking &&
        selectedBooking.status === "pending" &&
        Number(selectedBooking.hotel_id) === hotelId &&
        Number(selectedBooking.room_id) === Number(selectedRoom.id) &&
        selectedBooking.check_in.slice(0, 10) === checkIn &&
        selectedBooking.check_out.slice(0, 10) === checkOut &&
        Number(selectedBooking.rooms) === rooms &&
        Number(selectedBooking.guests) === guests
          ? selectedBooking
          : null;

      // Step 1: Create the booking, unless a matching pending
      // booking already exists.
      const booking = existingBooking
        ? existingBooking
        : await dispatch(
            createBooking({
              hotel_id: hotelId,
              room_id: Number(selectedRoom.id),
              check_in: checkIn,
              check_out: checkOut,
              rooms,
              guests,
            }),
          ).unwrap();

      // Step 2: Initialize payment using the booking ID.
      const payment = await dispatch(
        initializeBookingPayment(booking.id),
      ).unwrap();

      // Step 3: Redirect the customer to Paystack.
      window.location.href = payment.authorization_url;
    } catch (error) {
      // Redux stores API errors in bookingError.
      console.error("Booking or payment initialization failed:", error);
    }
  };

  if (!validHotelId) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <section className={styles.container}>
            <h1>Hotel unavailable</h1>
            <p>Invalid hotel ID.</p>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/home")}
            >
              Browse hotels
            </button>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const loading = isHotelLoading || roomsLoading;
  const loadError = hotelError || roomsError;

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(`/hotels/${hotelId}`)}
          >
            ← Back to hotel
          </button>

          <h1>Book Your Stay</h1>

          <p className={styles.intro}>
            Choose your dates and room details to make your reservation.
          </p>

          {loading && (
            <p className={styles.message} role="status">
              Loading booking details...
            </p>
          )}

          {loadError && (
            <div className={styles.error} role="alert">
              {loadError}
            </div>
          )}

          {hotel && (
            <div className={styles.hotelSummary}>
              <h2>{hotel.name}</h2>
              <p>
                {hotel.city}, {hotel.country}
              </p>
            </div>
          )}

          {formError && (
            <div className={styles.error} role="alert">
              {formError}
            </div>
          )}

          {bookingError && (
            <div className={styles.error} role="alert">
              {bookingError}
            </div>
          )}

          {!loading && !loadError && displayedRooms.length === 0 && (
            <p className={styles.message}>
              No room types have been added to this hotel yet.
            </p>
          )}

          {!loading && displayedRooms.length > 0 && (
            <form className={styles.form} onSubmit={handleBooking}>
              <label htmlFor="room">Room type</label>

              <select
                id="room"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                required
              >
                <option value="">Choose a room type</option>

                {displayedRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_type} —{" "}
                    {formatPrice(Number(room.price_per_night))} per night
                  </option>
                ))}
              </select>

              {selectedRoom && (
                <div className={styles.roomInfo}>
                  <h3>{selectedRoom.room_type}</h3>
                  <p>{selectedRoom.description}</p>
                  <p>
                    Maximum guests per room: {selectedRoom.capacity}
                  </p>
                </div>
              )}

              <div className={styles.dateGrid}>
                <div>
                  <label htmlFor="checkIn">Check-in</label>
                  <input
                    id="checkIn"
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="checkOut">Check-out</label>
                  <input
                    id="checkOut"
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.dateGrid}>
                <div>
                  <label htmlFor="rooms">Number of rooms</label>
                  <input
                    id="rooms"
                    type="number"
                    min="1"
                    max={selectedRoom?.total_rooms || undefined}
                    value={rooms}
                    onChange={(event) =>
                      setRooms(Math.max(1, Number(event.target.value)))
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="guests">Number of guests</label>
                  <input
                    id="guests"
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(event) =>
                      setGuests(Math.max(1, Number(event.target.value)))
                    }
                    required
                  />
                </div>
              </div>

              <div className={styles.priceSummary}>
                <h2>Price Summary</h2>

                <p>
                  Price per room, per night: {formatPrice(nightlyPrice)}
                </p>

                <p>Number of nights: {nights}</p>
                <p>Number of rooms: {rooms}</p>

                <div className={styles.total}>
                  Estimated total: {formatPrice(totalPrice)}
                </div>

                <p className={styles.note}>
                  The server validates availability and calculates the final
                  booking price.
                </p>
              </div>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={
                  isSaving ||
                  !token ||
                  !selectedRoom ||
                  nights <= 0 ||
                  totalPrice <= 0
                }
              >
                {isSaving ? "Preparing payment..." : "Proceed to Payment"}
              </button>

              {!token && (
                <p className={styles.note}>
                  Please{" "}
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate("/login")}
                  >
                    log in
                  </button>{" "}
                  to make a booking.
                </p>
              )}
            </form>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Booking;
