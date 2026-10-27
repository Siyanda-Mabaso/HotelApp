import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";

import {
  fetchHotels,
  updateHotel,
  deleteHotel,
  clearHotelError,
  type Hotel,
} from "../../ReduxSlice/hotelSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  const { hotels, isLoading, error, isSaving, mutationError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const { token, user } = useSelector((state: RootState) => state.login);

  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<HotelFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void dispatch(fetchHotels());
  }, [dispatch]);

  const formatPrice = (price: number) =>
    `R ${Number(price).toLocaleString("en-ZA")}`;

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
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

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

      <Footer />
    </div>
  );
};

export default ViewHotels;
