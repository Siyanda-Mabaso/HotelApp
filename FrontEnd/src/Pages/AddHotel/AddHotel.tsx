import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";

import { createHotel, clearHotelError } from "../../ReduxSlice/hotelSlice";
import {
  createRoom,
  clearRoomError,
  clearRoomSuccess,
  type RoomInput,
} from "../../ReduxSlice/roomSlice";
import { addHotelImage, clearImageErrors } from "../../ReduxSlice/imageSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button";

import styles from "./AddHotel.module.css";

interface HotelFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: string;
  price_per_night: string;
  facilities: string[];
}

interface RoomFormData {
  room_type: string;
  description: string;
  capacity: string;
  price_per_night: string;
  total_rooms: string;
}

const initialFormData: HotelFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  star_rating: "",
  price_per_night: "",
  facilities: [],
};

const emptyRoom: RoomFormData = {
  room_type: "",
  description: "",
  capacity: "2",
  price_per_night: "",
  total_rooms: "1",
};

const availableFacilities = [
  "Free Wi-Fi",
  "Parking",
  "Swimming Pool",
  "Restaurant",
  "Bar",
  "Air Conditioning",
  "Room Service",
  "Gym",
  "Spa",
  "Airport Shuttle",
  "Family Rooms",
  "Pet Friendly",
];

const AddHotel = () => {
  const [formData, setFormData] = useState<HotelFormData>(initialFormData);

  const [roomTypes, setRoomTypes] = useState<RoomFormData[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.login);

  const { isSaving: isSavingHotel, mutationError: hotelError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const { isSaving: isSavingRoom, mutationError: roomError } = useSelector(
    (state: RootState) => state.rooms,
  );

  const { isSaving: isSavingImage, mutationError: imageError } = useSelector(
    (state: RootState) => state.images,
  );

  const isSaving = isSavingHotel || isSavingRoom || isSavingImage;

  const handleChange = (field: keyof HotelFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    setSuccess("");
    dispatch(clearHotelError());
  };

  const handleFacilityChange = (facility: string) => {
    setFormData((previous) => ({
      ...previous,
      facilities: previous.facilities.includes(facility)
        ? previous.facilities.filter((item) => item !== facility)
        : [...previous.facilities, facility],
    }));

    setFormError("");
    setSuccess("");
    dispatch(clearHotelError());
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setImageUrls((previous) =>
      previous.map((url, urlIndex) => (urlIndex === index ? value : url)),
    );

    setFormError("");
    setSuccess("");
    dispatch(clearImageErrors());
  };

  const addImageField = () => {
    setImageUrls((previous) => [...previous, ""]);
  };

  const removeImageField = (index: number) => {
    setImageUrls((previous) =>
      previous.filter((_, urlIndex) => urlIndex !== index),
    );
  };

  const handleRoomChange = (
    index: number,
    field: keyof RoomFormData,
    value: string,
  ) => {
    setRoomTypes((previous) =>
      previous.map((room, roomIndex) =>
        roomIndex === index ? { ...room, [field]: value } : room,
      ),
    );

    setFormError("");
    setSuccess("");
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
  };

  const addRoomType = () => {
    setRoomTypes((previous) => [...previous, { ...emptyRoom }]);

    setFormError("");
    setSuccess("");
  };

  const removeRoomType = (index: number) => {
    setRoomTypes((previous) =>
      previous.filter((_, roomIndex) => roomIndex !== index),
    );

    setFormError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    dispatch(clearHotelError());
    dispatch(clearRoomError());
    dispatch(clearRoomSuccess());
    dispatch(clearImageErrors());

    if (!token || !user) {
      setFormError("Please log in before adding a hotel.");
      return;
    }

    if (user.role !== "admin") {
      setFormError("Access denied. Only administrators can add hotels.");
      return;
    }

    const requiredHotelFields = [
      formData.name,
      formData.description,
      formData.address,
      formData.city,
      formData.country,
    ];

    if (requiredHotelFields.some((value) => !value.trim())) {
      setFormError("Please complete all required hotel fields.");
      return;
    }

    const starRating = Number(formData.star_rating);
    const hotelPrice = Number(formData.price_per_night);

    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      setFormError("Please select a valid hotel star rating.");
      return;
    }

    if (
      formData.price_per_night.trim() === "" ||
      !Number.isFinite(hotelPrice) ||
      hotelPrice < 0
    ) {
      setFormError("Please enter a valid hotel price per night.");
      return;
    }

    // Validate image URLs before creating the hotel.
    const validImageUrls = imageUrls
      .map((url) => url.trim())
      .filter((url) => url !== "");

    for (const imageUrl of validImageUrls) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          setFormError("Hotel image URLs must start with http:// or https://.");
          return;
        }
      } catch {
        setFormError(`Please enter a valid image URL: ${imageUrl}`);
        return;
      }
    }

    // Validate all room types before creating the hotel.
    for (let index = 0; index < roomTypes.length; index += 1) {
      const room = roomTypes[index];
      const roomNumber = index + 1;
      const capacity = Number(room.capacity);
      const roomPrice = Number(room.price_per_night);
      const totalRooms = Number(room.total_rooms);

      if (
        !room.room_type.trim() ||
        !room.description.trim() ||
        room.capacity.trim() === "" ||
        room.price_per_night.trim() === "" ||
        room.total_rooms.trim() === ""
      ) {
        setFormError(`Please complete all fields for Room Type ${roomNumber}.`);
        return;
      }

      if (!Number.isInteger(capacity) || capacity < 1) {
        setFormError(
          `Room Type ${roomNumber}: capacity must be a whole number greater than zero.`,
        );
        return;
      }

      if (!Number.isFinite(roomPrice) || roomPrice < 0) {
        setFormError(`Room Type ${roomNumber}: enter a valid price per night.`);
        return;
      }

      if (!Number.isInteger(totalRooms) || totalRooms < 0) {
        setFormError(
          `Room Type ${roomNumber}: number of rooms must be a whole number of zero or more.`,
        );
        return;
      }

      const duplicateRoomType = roomTypes.some(
        (otherRoom, otherIndex) =>
          otherIndex !== index &&
          otherRoom.room_type.trim().toLowerCase() ===
            room.room_type.trim().toLowerCase(),
      );

      if (duplicateRoomType) {
        setFormError(
          `Room type "${room.room_type.trim()}" appears more than once. Please use unique room type names.`,
        );
        return;
      }
    }

    try {
      // 1. Create the hotel.
      const createdHotel = await dispatch(
        createHotel({
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          star_rating: starRating,
          price_per_night: hotelPrice,
          facilities: formData.facilities,
          token,
        }),
      ).unwrap();

      // 2. Save images against the newly created hotel.
      for (const imageUrl of validImageUrls) {
        await dispatch(
          addHotelImage({
            hotelId: createdHotel.id,
            image_url: imageUrl,
            token,
          }),
        ).unwrap();
      }

      // 3. Create room types against the new hotel.
      for (const room of roomTypes) {
        const roomData: RoomInput = {
          hotel_id: createdHotel.id,
          room_type: room.room_type.trim(),
          description: room.description.trim(),
          capacity: Number(room.capacity),
          price_per_night: Number(room.price_per_night),
          total_rooms: Number(room.total_rooms),
        };

        await dispatch(createRoom(roomData)).unwrap();
      }

      setSuccess("Hotel, images and room types saved successfully!");

      setFormData({ ...initialFormData });
      setRoomTypes([]);
      setImageUrls([""]);
    } catch {
      // The individual Redux slices display their request errors.
      // The hotel may already exist if a later image or room request fails.
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.heading}>
          <Link to="/admin" className={styles.backLink}>
            ← Back to Dashboard
          </Link>

          <h1>Add a Hotel</h1>
          <p>
            Enter the hotel details, facilities, images and optional room types.
          </p>
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>Hotel Information</h2>

          <Input
            label="Hotel Name"
            name="name"
            placeholder="Enter hotel name"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            required
          />

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the hotel"
              value={formData.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              rows={4}
              required
            />
          </div>

          <Input
            label="Street Address"
            name="address"
            placeholder="Enter street address"
            value={formData.address}
            onChange={(value) => handleChange("address", value)}
            required
          />

          <div className={styles.formRow}>
            <Input
              label="City"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={(value) => handleChange("city", value)}
              required
            />

            <Input
              label="Country"
              name="country"
              placeholder="Enter country"
              value={formData.country}
              onChange={(value) => handleChange("country", value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="star_rating">Star Rating</label>
              <select
                id="star_rating"
                name="star_rating"
                value={formData.star_rating}
                onChange={(event) =>
                  handleChange("star_rating", event.target.value)
                }
                required
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <Input
              label="Hotel Price Per Night (R)"
              name="price_per_night"
              type="number"
              placeholder="e.g. 1200"
              value={formData.price_per_night}
              onChange={(value) => handleChange("price_per_night", value)}
              required
            />
          </div>

          <div className={styles.facilitiesSection}>
            <h2>Hotel Facilities</h2>
            <p>Select all facilities available at this hotel.</p>

            <div className={styles.facilitiesGrid}>
              {availableFacilities.map((facility) => (
                <label key={facility} className={styles.facilityOption}>
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityChange(facility)}
                    disabled={isSaving}
                  />
                  <span>{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.imageSection}>
            <h2>Hotel Images</h2>
            <p>Add publicly accessible image URLs for the hotel gallery.</p>

            {imageUrls.map((url, index) => (
              <div className={styles.imageUrlRow} key={index}>
                <div className={styles.inputGroup}>
                  <label htmlFor={`hotel-image-${index}`}>
                    Image URL {index + 1}
                  </label>
                  <input
                    id={`hotel-image-${index}`}
                    type="url"
                    placeholder="https://example.com/hotel-image.jpg"
                    value={url}
                    onChange={(event) =>
                      handleImageUrlChange(index, event.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeRoomButton}
                    onClick={() => removeImageField(index)}
                    disabled={isSaving}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className={styles.addRoomButton}
              onClick={addImageField}
              disabled={isSaving}
            >
              + Add Another Image
            </button>
          </div>

          <div className={styles.roomSection}>
            <div className={styles.roomSectionHeading}>
              <div>
                <h2>Room Types</h2>
                <p>Optional: add the types of rooms guests can book.</p>
              </div>

              <button
                type="button"
                className={styles.addRoomButton}
                onClick={addRoomType}
                disabled={isSaving}
              >
                + Add Room Type
              </button>
            </div>

            {roomTypes.length === 0 && (
              <p className={styles.noRoomsMessage}>
                No room types added yet. Click “Add Room Type” to include them.
              </p>
            )}

            {roomTypes.map((room, index) => (
              <section className={styles.roomCard} key={index}>
                <div className={styles.roomCardHeading}>
                  <h3>Room Type {index + 1}</h3>

                  <button
                    type="button"
                    className={styles.removeRoomButton}
                    onClick={() => removeRoomType(index)}
                    disabled={isSaving}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor={`room-type-${index}`}>Room Type Name</label>
                  <input
                    id={`room-type-${index}`}
                    value={room.room_type}
                    onChange={(event) =>
                      handleRoomChange(index, "room_type", event.target.value)
                    }
                    placeholder="e.g. Standard Room, Deluxe Suite"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor={`room-description-${index}`}>
                    Room Description
                  </label>
                  <textarea
                    id={`room-description-${index}`}
                    value={room.description}
                    onChange={(event) =>
                      handleRoomChange(index, "description", event.target.value)
                    }
                    placeholder="Describe the room"
                    rows={3}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor={`room-capacity-${index}`}>
                      Guest Capacity
                    </label>
                    <input
                      id={`room-capacity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={room.capacity}
                      onChange={(event) =>
                        handleRoomChange(index, "capacity", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`room-price-${index}`}>
                      Room Price Per Night (R)
                    </label>
                    <input
                      id={`room-price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.price_per_night}
                      onChange={(event) =>
                        handleRoomChange(
                          index,
                          "price_per_night",
                          event.target.value,
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor={`room-total-${index}`}>
                    Number of Rooms of This Type
                  </label>
                  <input
                    id={`room-total-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={room.total_rooms}
                    onChange={(event) =>
                      handleRoomChange(index, "total_rooms", event.target.value)
                    }
                    required
                  />
                </div>
              </section>
            ))}
          </div>

          {formError && (
            <p className={styles.errorMessage} role="alert">
              {formError}
            </p>
          )}

          {hotelError && (
            <p className={styles.errorMessage} role="alert">
              {hotelError}
            </p>
          )}

          {imageError && (
            <p className={styles.errorMessage} role="alert">
              {imageError}
            </p>
          )}

          {roomError && (
            <p className={styles.errorMessage} role="alert">
              {roomError}
            </p>
          )}

          {success && (
            <p className={styles.successMessage} role="status">
              {success}
            </p>
          )}

          <div className={styles.formActions}>
            <Button
              text={
                isSaving
                  ? "Saving..."
                  : roomTypes.length > 0
                    ? "Save Hotel, Images and Rooms"
                    : "Add Hotel"
              }
              type="submit"
              disabled={isSaving}
            />

            <Button
              text="Cancel"
              type="button"
              onClick={() => navigate("/admin")}
              disabled={isSaving}
            />
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddHotel;
