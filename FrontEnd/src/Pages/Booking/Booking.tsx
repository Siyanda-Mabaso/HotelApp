
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../Store/store";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import styles from "./Booking.module.css";

interface Hotel {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface Room {
  id: number;
  hotel_id: number;
  room_type: string;
  description: string;
  capacity: number;
  price_per_night: number | string;
  total_rooms: number;
}

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.login.token);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError("");

        const [hotelResponse, roomsResponse] = await Promise.all([
          axios.get(`/api/hotels/${id}`),
         axios.get(`/api/hotels/${id}/rooms`)
        ]);

        const hotelData = hotelResponse.data.hotel ?? hotelResponse.data;
        const roomData = roomsResponse.data.rooms ?? roomsResponse.data;

        setHotel(hotelData);
        setRoomsList(roomData);

        if (roomData.length > 0) {
          setRoomId(String(roomData[0].id));
        }
      } catch {
        setError(
          "Unable to load the hotel and room types. Please check that the backend room endpoint is available.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadBookingData();
    }
  }, [id]);

  const selectedRoom = roomsList.find(
    (room) => String(room.id) === roomId,
  );

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

  const today = new Date().toLocaleDateString("en-CA");

  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedRoom) {
      setError("Please select a room type.");
      return;
    }

    if (checkIn < today) {
      setError("Check-in cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    if (guests > selectedRoom.capacity * rooms) {
      setError(
        `This room type accommodates up to ${selectedRoom.capacity} guests per room. Please select more rooms.`,
      );
      return;
    }

    if (rooms > selectedRoom.total_rooms) {
      setError("Please select fewer rooms.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        "/api/bookings",
        {
          hotel_id: Number(id),
          room_id: selectedRoom.id,
          check_in: checkIn,
          check_out: checkOut,
          rooms,
          guests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess(
        response.data.message || "Your booking was created successfully!",
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to create your booking. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <p className={styles.message}>Loading booking details...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(`/hotels/${id}`)}
          >
            ← Back to hotel
          </button>

          <h1>Book Your Stay</h1>
          <p className={styles.intro}>
            Choose your dates and room details to make your reservation.
          </p>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {!error || hotel ? (
            hotel && (
              <div className={styles.hotelSummary}>
                <h2>{hotel.name}</h2>
                <p>
                  {hotel.city}, {hotel.country}
                </p>
              </div>
            )
          ) : null}

          {roomsList.length === 0 ? (
            <p className={styles.message}>
              No room types are available for this hotel yet.
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleBooking}>
              <label htmlFor="room">Room type</label>
              <select
                id="room"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                required
              >
                {roomsList.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_type} — R
                    {Number(room.price_per_night).toFixed(2)} per night
                  </option>
                ))}
              </select>

              {selectedRoom && (
                <div className={styles.roomInfo}>
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
                    max={selectedRoom?.total_rooms || 1}
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
                  Price per room, per night: R{nightlyPrice.toFixed(2)}
                </p>
                <p>Number of nights: {nights}</p>
                <p>Number of rooms: {rooms}</p>
                <div className={styles.total}>
                  Estimated total: R{totalPrice.toFixed(2)}
                </div>
                <p className={styles.note}>
                  The final price is calculated and validated by the server.
                </p>
              </div>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={submitting || nights <= 0 || totalPrice <= 0}
              >
                {submitting ? "Creating booking..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Booking;
