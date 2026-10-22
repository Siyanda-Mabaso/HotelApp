
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import type { RootState } from "../../Store/store";

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
  const [formData, setFormData] =
    useState<HotelFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const token = useSelector(
    (state: RootState) => state.login.token,
  );

  const user = useSelector(
    (state: RootState) => state.login.user,
  );

  const handleChange = (
    field: keyof HotelFormData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token || !user) {
      setError("Please log in before adding a hotel.");
      return;
    }

    if (user.role !== "admin") {
      setError("Access denied. Only administrators can add hotels.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        "/api/hotels",
        {
          ...formData,
          star_rating: Number(formData.star_rating),
          price_per_night: Number(formData.price_per_night),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess("Hotel added successfully!");
      setFormData({ ...initialFormData });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to add hotel. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
            Enter the accommodation details to list it on Paradise.
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
              onChange={(value) =>
                handleChange("price_per_night", value)
              }
              required
            />
          </div>

          {error && (
            <p className={styles.errorMessage}>{error}</p>
          )}

          {success && (
            <p className={styles.successMessage}>{success}</p>
          )}

          <div className={styles.formActions}>
            <Button
              text={isLoading ? "Adding Hotel..." : "Add Hotel"}
              type="submit"
              disabled={isLoading}
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
