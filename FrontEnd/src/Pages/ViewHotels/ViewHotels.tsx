import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../Store/store";

import {
  fetchHotels,
  updateHotel,
  deleteHotel,
  clearHotelError,
  type Hotel,
} from "../../ReduxSlice/hotelSlice";

import {
  fetchHotelImages,
  addHotelImage,
  deleteHotelImage,
  clearImageErrors,
  type HotelImage,
} from "../../ReduxSlice/imageSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import styles from "./ViewHotels.module.css";

interface HotelFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: string;
  price_per_night: string;
}

const emptyForm: HotelFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  star_rating: "",
  price_per_night: "",
};

const ViewHotels = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { hotels, isLoading, error, isSaving, mutationError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const { token, user } = useSelector((state: RootState) => state.login);

  const {
    images,
    isLoading: isImagesLoading,
    isSaving: isImageSaving,
    error: imageError,
    mutationError: imageMutationError,
  } = useSelector((state: RootState) => state.images);

  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<HotelFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [managingHotel, setManagingHotel] = useState<Hotel | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFormError, setImageFormError] = useState("");
  const [imageSuccessMessage, setImageSuccessMessage] = useState("");

  useEffect(() => {
    void dispatch(fetchHotels());
  }, [dispatch]);

  const formatPrice = (price: number) =>
    `R ${Number(price).toLocaleString("en-ZA")}`;

  // ---------------- HOTEL MANAGEMENT ----------------

  const handleEditClick = (hotel: Hotel) => {
    setEditingHotel(hotel);

    setFormData({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      star_rating: String(hotel.star_rating),
      price_per_night: String(hotel.price_per_night),
    });

    setFormError("");
    setSuccessMessage("");
    dispatch(clearHotelError());
  };

  const handleFormChange = (field: keyof HotelFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    setSuccessMessage("");
    dispatch(clearHotelError());
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingHotel) return;

    if (!token || user?.role !== "admin") {
      setFormError("Only logged-in administrators can edit hotels.");
      return;
    }

    const starRating = Number(formData.star_rating);
    const pricePerNight = Number(formData.price_per_night);

    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      setFormError("Please select a valid star rating.");
      return;
    }

    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      setFormError("Please enter a valid price per night.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.country.trim()
    ) {
      setFormError("Please complete all hotel fields.");
      return;
    }

    setFormError("");
    setSuccessMessage("");
    dispatch(clearHotelError());

    try {
      await dispatch(
        updateHotel({
          id: editingHotel.id,
          token,
          hotel: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            country: formData.country.trim(),
            star_rating: starRating,
            price_per_night: pricePerNight,
            facilities: editingHotel.facilities ?? [],
          },
        }),
      ).unwrap();

      setEditingHotel(null);
      setFormData(emptyForm);
      setSuccessMessage("Hotel updated successfully!");
    } catch {
      // The error is stored in Redux as mutationError.
    }
  };

  const handleDelete = async (hotel: Hotel) => {
    if (!token || user?.role !== "admin") {
      setFormError("Only logged-in administrators can delete hotels.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${hotel.name}"?`,
    );

    if (!confirmed) return;

    setFormError("");
    setSuccessMessage("");
    dispatch(clearHotelError());

    try {
      await dispatch(
        deleteHotel({
          id: hotel.id,
          token,
        }),
      ).unwrap();

      setSuccessMessage(`"${hotel.name}" was deleted successfully.`);
    } catch {
      // The error is stored in Redux as mutationError.
    }
  };

  // ---------------- IMAGE MANAGEMENT ----------------

  const handleManageImages = (hotel: Hotel) => {
    setManagingHotel(hotel);
    setImageUrl("");
    setImageFormError("");
    setImageSuccessMessage("");

    dispatch(clearImageErrors());

    void dispatch(fetchHotelImages(hotel.id));
  };

  const handleCloseImageModal = () => {
    if (isImageSaving) return;

    setManagingHotel(null);
    setImageUrl("");
    setImageFormError("");
    setImageSuccessMessage("");
    dispatch(clearImageErrors());
  };

  const handleAddImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!managingHotel) return;

    if (!token || user?.role !== "admin") {
      setImageFormError("Only logged-in administrators can add images.");
      return;
    }

    const trimmedUrl = imageUrl.trim();

    if (!/^https?:\/\/\S+$/i.test(trimmedUrl)) {
      setImageFormError("Please enter a valid image URL.");
      return;
    }

    setImageFormError("");
    setImageSuccessMessage("");
    dispatch(clearImageErrors());

    try {
      await dispatch(
        addHotelImage({
          hotelId: managingHotel.id,
          image_url: trimmedUrl,
          token,
        }),
      ).unwrap();

      setImageUrl("");
      setImageSuccessMessage("Image added successfully!");
    } catch {
      // The error is stored in Redux as mutationError.
    }
  };

  const handleDeleteImage = async (image: HotelImage) => {
    if (!token || user?.role !== "admin") {
      setImageFormError("Only logged-in administrators can delete images.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) return;

    setImageFormError("");
    setImageSuccessMessage("");
    dispatch(clearImageErrors());

    try {
      await dispatch(
        deleteHotelImage({
          imageId: image.id,
          token,
        }),
      ).unwrap();

      setImageSuccessMessage("Image deleted successfully!");
    } catch {
      // The error is stored in Redux as mutationError.
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

          <div className={styles.headingRow}>
            <div>
              <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
              <h1>View Hotels</h1>
              <p className={styles.subtitle}>
                View and manage your accommodation listings.
              </p>
            </div>

            <Link to="/admin/hotels/add" className={styles.addButton}>
              + Add Hotel
            </Link>
          </div>
        </div>

        <section className={styles.hotelSection}>
          <div className={styles.sectionHeader}>
            <h2>Hotel Listings</h2>

            <span className={styles.hotelCount}>
              {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}
            </span>
          </div>

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

          {isLoading && (
            <p className={styles.message} role="status">
              Loading hotels...
            </p>
          )}

          {!isLoading && error && (
            <div className={styles.errorBox}>
              <p>{error}</p>

              <button
                type="button"
                className={styles.retryButton}
                onClick={() => void dispatch(fetchHotels())}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && hotels.length === 0 && (
            <div className={styles.emptyState}>
              <h3>No hotels available yet</h3>
              <p>Add your first hotel to display it here.</p>

              <Link to="/admin/hotels/add" className={styles.addButton}>
                Add Your First Hotel
              </Link>
            </div>
          )}

          {!isLoading && !error && hotels.length > 0 && (
            <div className={styles.hotelGrid}>
              {hotels.map((hotel) => (
                <article className={styles.hotelCard} key={hotel.id}>
                  <div className={styles.hotelTop}>
                    <div className={styles.hotelIcon}>⌂</div>

                    <span className={styles.rating}>
                      ★ {hotel.star_rating} / 5
                    </span>
                  </div>

                  <div className={styles.hotelInfo}>
                    <h3>{hotel.name}</h3>

                    <p className={styles.location}>
                      {hotel.address}, {hotel.city}, {hotel.country}
                    </p>

                    <p className={styles.description}>{hotel.description}</p>

                    <div className={styles.cardFooter}>
                      <div>
                        <strong>{formatPrice(hotel.price_per_night)}</strong>
                        <span className={styles.perNight}> / night</span>
                      </div>
                    </div>

                    <div className={styles.managementActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleEditClick(hotel)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => void handleDelete(hotel)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Please wait..." : "Delete"}
                      </button>

                      <button
                        type="button"
                        className={styles.manageRoomsButton}
                        onClick={() =>
                          navigate(`/admin/hotels/${hotel.id}/rooms`)
                        }
                      >
                        Manage Rooms
                      </button>

                      <button
                        type="button"
                        className={styles.manageRoomsButton}
                        onClick={() => handleManageImages(hotel)}
                      >
                        Manage Images
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* EDIT HOTEL MODAL */}
      {editingHotel && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setEditingHotel(null);
              setFormError("");
              dispatch(clearHotelError());
            }
          }}
        >
          <section
            className={styles.editModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-hotel-title"
          >
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
                <h2 id="edit-hotel-title">Edit Hotel</h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setEditingHotel(null);
                  setFormError("");
                  dispatch(clearHotelError());
                }}
                disabled={isSaving}
                aria-label="Close edit form"
              >
                ×
              </button>
            </div>

            <form className={styles.editForm} onSubmit={handleUpdate}>
              <label>
                Hotel Name
                <input
                  value={formData.name}
                  onChange={(event) =>
                    handleFormChange("name", event.target.value)
                  }
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
                  rows={4}
                  required
                />
              </label>

              <label>
                Street Address
                <input
                  value={formData.address}
                  onChange={(event) =>
                    handleFormChange("address", event.target.value)
                  }
                  required
                />
              </label>

              <div className={styles.editFormRow}>
                <label>
                  City
                  <input
                    value={formData.city}
                    onChange={(event) =>
                      handleFormChange("city", event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Country
                  <input
                    value={formData.country}
                    onChange={(event) =>
                      handleFormChange("country", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <div className={styles.editFormRow}>
                <label>
                  Star Rating
                  <select
                    value={formData.star_rating}
                    onChange={(event) =>
                      handleFormChange("star_rating", event.target.value)
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
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditingHotel(null);
                    setFormError("");
                    dispatch(clearHotelError());
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MANAGE HOTEL IMAGES MODAL */}
      {managingHotel && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isImageSaving) {
              handleCloseImageModal();
            }
          }}
        >
          <section
            className={styles.editModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-images-title"
          >
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
                <h2 id="manage-images-title">Manage Images</h2>
                <p>{managingHotel.name}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseImageModal}
                disabled={isImageSaving}
                aria-label="Close image management"
              >
                ×
              </button>
            </div>

            <form className={styles.editForm} onSubmit={handleAddImage}>
              <label>
                Image URL
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setImageFormError("");
                    setImageSuccessMessage("");
                  }}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </label>

              <button
                type="submit"
                className={styles.editButton}
                disabled={isImageSaving}
              >
                {isImageSaving ? "Please wait..." : "Add Image"}
              </button>
            </form>

            {imageFormError && (
              <p className={styles.errorMessage} role="alert">
                {imageFormError}
              </p>
            )}

            {imageError && (
              <p className={styles.errorMessage} role="alert">
                {imageError}
              </p>
            )}

            {imageMutationError && (
              <p className={styles.errorMessage} role="alert">
                {imageMutationError}
              </p>
            )}

            {imageSuccessMessage && (
              <p className={styles.successMessage} role="status">
                {imageSuccessMessage}
              </p>
            )}

            <h3>Hotel Gallery</h3>

            {isImagesLoading && (
              <p className={styles.message} role="status">
                Loading images...
              </p>
            )}

            {!isImagesLoading && !imageError && images.length === 0 && (
              <p className={styles.message}>
                No images have been added to this hotel yet.
              </p>
            )}

            {!isImagesLoading && images.length > 0 && (
              <div className={styles.hotelGrid}>
                {images.map((image) => (
                  <article key={image.id} className={styles.hotelCard}>
                    <img
                      src={image.image_url}
                      alt={`${managingHotel.name} accommodation`}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(event) => {
                        event.currentTarget.alt = "Unable to load this image";
                      }}
                    />

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => void handleDeleteImage(image)}
                      disabled={isImageSaving}
                    >
                      {isImageSaving ? "Please wait..." : "Delete Image"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ViewHotels;
