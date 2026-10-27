import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";

import { createHotel, clearHotelError } from "../../ReduxSlice/hotelSlice";

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
}

const initialFormData: HotelFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  star_rating: "",
  price_per_night: "",
};

const AddHotel = () => {
  const [formData, setFormData] = useState<HotelFormData>(initialFormData);

  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.login);

  const { isSaving, mutationError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const handleChange = (field: keyof HotelFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    setSuccess("");
    dispatch(clearHotelError());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");
    dispatch(clearHotelError());

    if (!token || !user) {
      setFormError("Please log in before adding a hotel.");
      return;
    }

    if (user.role !== "admin") {
      setFormError("Access denied. Only administrators can add hotels.");
      return;
    }

    const starRating = Number(formData.star_rating);
    const pricePerNight = Number(formData.price_per_night);

    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      setFormError("Please select a valid hotel star rating.");
      return;
    }

    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      setFormError("Please enter a valid price per night.");
      return;
    }

    try {
      await dispatch(
        createHotel({
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          star_rating: starRating,
          price_per_night: pricePerNight,
          token,
        }),
      ).unwrap();

      setSuccess("Hotel added successfully!");
      setFormData({ ...initialFormData });
    } catch {
      // Redux stores the API error in hotels.mutationError.
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
          <p>Enter the accommodation details to list it on Paradise.</p>
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
              placeholder="Describe the hotel and its facilities"
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
              label="Price Per Night (R)"
              name="price_per_night"
              type="number"
              placeholder="e.g. 1200"
              value={formData.price_per_night}
              onChange={(value) => handleChange("price_per_night", value)}
              required
            />
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

          {success && (
            <p className={styles.successMessage} role="status">
              {success}
            </p>
          )}

          <div className={styles.formActions}>
            <Button
              text={isSaving ? "Adding Hotel..." : "Add Hotel"}
              type="submit"
              disabled={isSaving}
            />

            <Button
              text="Cancel"
              type="button"
              onClick={() => navigate("/admin")}
            />
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddHotel;
