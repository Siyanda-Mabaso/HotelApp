import { useEffect, useState, type FormEvent } from "react";
import { Link ,useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";
import { fetchHotels, type Hotel } from "../../ReduxSlice/hotelSlice";
import {
  fetchRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom,
  clearRoomError,
  clearRoomSuccess,
  type Room,
  type RoomInput,
} from "../../ReduxSlice/roomSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./ManageRooms.module.css";

interface RoomFormData {
  room_type: string;
  description: string;
  capacity: string;
  price_per_night: string;
  total_rooms: string;
}

const emptyForm: RoomFormData = {
  room_type: "",
  description: "",
  capacity: "1",
  price_per_night: "",
  total_rooms: "1",
};

const ManageRooms = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    hotels,
    isLoading: hotelsLoading,
    error: hotelsError,
  } = useSelector((state: RootState) => state.hotels);

  const { rooms, isLoading, isSaving, error, mutationError, successMessage } =
    useSelector((state: RootState) => state.rooms);

  const { token, user } = useSelector((state: RootState) => state.login);


  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<RoomFormData>(emptyForm);
  const [formError, setFormError] = useState("");


const { hotelId } = useParams();
const selectedHotelId = Number(hotelId);

useEffect(() => {
  void dispatch(fetchHotels());
}, [dispatch]);

useEffect(() => {
  if (Number.isInteger(selectedHotelId) && selectedHotelId > 0) {
    void dispatch(fetchRoomsByHotel(selectedHotelId));
  }
}, [dispatch, selectedHotelId]);


  // Show only rooms belonging to the selected hotel.
const displayedRooms = rooms.filter(
  (room) => Number(room.hotel_id) === selectedHotelId,
);
  const formatPrice = (price: number) =>
    `R ${Number(price).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingRoom(null);
    setIsModalOpen(false);
    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData(emptyForm);
    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_type: room.room_type,
      description: room.description,
      capacity: String(room.capacity),
      price_per_night: String(room.price_per_night),
      total_rooms: String(room.total_rooms),
    });
    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof RoomFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || user?.role !== "admin") {
      setFormError("Only logged-in administrators can manage room types.");
      return;
    }

    if (!selectedHotelId) {
      setFormError("Please select a hotel first.");
      return;
    }

    const capacity = Number(formData.capacity);
    const pricePerNight = Number(formData.price_per_night);
    const totalRooms = Number(formData.total_rooms);

    if (!formData.room_type.trim() || !formData.description.trim()) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setFormError("Capacity must be a whole number greater than zero.");
      return;
    }

    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      setFormError("Please enter a valid price per night.");
      return;
    }

    if (!Number.isInteger(totalRooms) || totalRooms < 0) {
      setFormError("Number of rooms must be a whole number of zero or more.");
      return;
    }

    const roomData: Omit<RoomInput, "hotel_id"> = {
      room_type: formData.room_type.trim(),
      description: formData.description.trim(),
      capacity,
      price_per_night: pricePerNight,
      total_rooms: totalRooms,
    };

    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());

    try {
      if (editingRoom) {
        await dispatch(
          updateRoom({
            id: editingRoom.id,
            roomData,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createRoom({
            hotel_id: Number(selectedHotelId),
            ...roomData,
          }),
        ).unwrap();
      }

      setFormData(emptyForm);
      setEditingRoom(null);
      setIsModalOpen(false);
      setFormError("");
    } catch {
      // Redux stores backend errors in mutationError.
    }
  };

  const handleDelete = async (room: Room) => {
    if (!token || user?.role !== "admin") {
      setFormError("Only logged-in administrators can delete room types.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the "${room.room_type}" room type?`,
    );

    if (!confirmed) return;

    setFormError("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());

    try {
      await dispatch(
        deleteRoom({
          id: room.id,
          hotel_id: room.hotel_id,
        }),
      ).unwrap();
    } catch {
      // Redux stores backend errors in mutationError.
    }
  };

const selectedHotel = hotels.find(
  (hotel: Hotel) => Number(hotel.id) === selectedHotelId,
);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.heading}>
          <Link to="/admin" className={styles.backLink}>
            ← Back to Dashboard
          </Link>

          <div className={styles.headingRow}>
            <div>
              <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
              <h1>Manage Rooms</h1>
              <p className={styles.subtitle}>
                Add and manage the room types available at each hotel.
              </p>
            </div>

            <button
              type="button"
              className={styles.addButton}
              onClick={openAddModal}
              disabled={!selectedHotelId || hotelsLoading}
            >
              + Add Room Type
            </button>
          </div>
        </div>

        <section className={styles.roomSection}>
 
{selectedHotel && (
  <div className={styles.hotelSelector}>
    <label>Selected Hotel</label>
    <p>{selectedHotel.name}</p>
  </div>
)}


          {hotelsLoading && <p className={styles.message}>Loading hotels...</p>}

          {hotelsError && (
            <div className={styles.errorBox} role="alert">
              <p>{hotelsError}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => void dispatch(fetchHotels())}
              >
                Try Again
              </button>
            </div>
          )}

          {!hotelsLoading && !hotelsError && hotels.length === 0 && (
            <div className={styles.emptyState}>
              <h2>No hotels available</h2>
              <p>Add a hotel before creating its room types.</p>
              <Link to="/admin/hotels/add" className={styles.addButton}>
                Add Hotel
              </Link>
            </div>
          )}

          {selectedHotel && (
            <div className={styles.sectionHeader}>
              <div>
                <h2>{selectedHotel.name}</h2>
                <p>Room types for this accommodation</p>
              </div>

              <span className={styles.roomCount}>
                {displayedRooms.length}{" "}
                {displayedRooms.length === 1 ? "room type" : "room types"}
              </span>
            </div>
          )}

          {successMessage && (
            <p className={styles.successMessage} role="status">
              {successMessage}
            </p>
          )}

          {formError && (
            <p className={styles.errorMessage} role="alert">
              {formError}
            </p>
          )}

          {mutationError && (
            <p className={styles.errorMessage} role="alert">
              {mutationError}
            </p>
          )}

          {selectedHotelId && isLoading && (
            <p className={styles.message} role="status">
              Loading room types...
            </p>
          )}

          {selectedHotelId && !isLoading && error && (
            <div className={styles.errorBox} role="alert">
              <p>{error}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() =>
                  void dispatch(fetchRoomsByHotel(Number(selectedHotelId)))
                }
              >
                Try Again
              </button>
            </div>
          )}

          {selectedHotelId &&
            !isLoading &&
            !error &&
            displayedRooms.length === 0 && (
              <div className={styles.emptyState}>
                <h2>No room types yet</h2>
                <p>
                  Add the first room type for{" "}
                  {selectedHotel?.name || "this hotel"}.
                </p>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={openAddModal}
                >
                  + Add First Room Type
                </button>
              </div>
            )}

          {!isLoading && !error && displayedRooms.length > 0 && (
            <div className={styles.roomGrid}>
              {displayedRooms.map((room) => (
                <article className={styles.roomCard} key={room.id}>
                  <div className={styles.roomTop}>
                    <div className={styles.roomIcon}>⌂</div>
                    <span className={styles.capacity}>
                      {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
                    </span>
                  </div>

                  <div className={styles.roomInfo}>
                    <h3>{room.room_type}</h3>
                    <p className={styles.description}>{room.description}</p>

                    <div className={styles.roomDetails}>
                      <div>
                        <span>Price per night</span>
                        <strong>{formatPrice(room.price_per_night)}</strong>
                      </div>

                      <div>
                        <span>Rooms available to allocate</span>
                        <strong>{room.total_rooms}</strong>
                      </div>
                    </div>

                    <div className={styles.managementActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => openEditModal(room)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => void handleDelete(room)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Please wait..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              resetForm();
            }
          }}
        >
          <section
            className={styles.editModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-modal-title"
          >
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
                <h2 id="room-modal-title">
                  {editingRoom ? "Edit Room Type" : "Add Room Type"}
                </h2>
                <p className={styles.modalSubtitle}>
                  Hotel: {selectedHotel?.name}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={resetForm}
                disabled={isSaving}
                aria-label="Close room form"
              >
                ×
              </button>
            </div>

            <form className={styles.editForm} onSubmit={handleSubmit}>
              <label>
                Room Type
                <input
                  value={formData.room_type}
                  onChange={(event) =>
                    handleFormChange("room_type", event.target.value)
                  }
                  placeholder="e.g. Standard Room, Deluxe Suite"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    handleFormChange("description", event.target.value)
                  }
                  placeholder="Describe the room and its features"
                  rows={4}
                  required
                />
              </label>

              <div className={styles.editFormRow}>
                <label>
                  Guest Capacity
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.capacity}
                    onChange={(event) =>
                      handleFormChange("capacity", event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Price Per Night (R)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(event) =>
                      handleFormChange("price_per_night", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Number of Rooms
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.total_rooms}
                  onChange={(event) =>
                    handleFormChange("total_rooms", event.target.value)
                  }
                  required
                />
              </label>

              {formError && (
                <p className={styles.errorMessage} role="alert">
                  {formError}
                </p>
              )}

              {mutationError && (
                <p className={styles.errorMessage} role="alert">
                  {mutationError}
                </p>
              )}

              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.editButton}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingRoom
                      ? "Save Changes"
                      : "Add Room Type"}
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageRooms;
