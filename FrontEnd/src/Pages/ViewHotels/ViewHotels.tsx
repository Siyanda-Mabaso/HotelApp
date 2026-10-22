
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./ViewHotels.module.css";

interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  price_per_night: number;
}

const ViewHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await axios.get("/api/hotels");

        // Support either an array or an object containing a hotels array.
        const hotelData = Array.isArray(response.data)
          ? response.data
          : response.data.hotels;

        if (Array.isArray(hotelData)) {
          setHotels(hotelData);
        } else {
          setError("The server returned an unexpected hotel list.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Unable to load hotels. Please try again.",
          );
        } else {
          setError("Something went wrong while loading hotels.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const formatPrice = (price: number) =>
    `R ${Number(price).toLocaleString("en-ZA")}`;

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

            <Link
              to="/admin/hotels/add"
              className={styles.addButton}
            >
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

          {isLoading && (
            <p className={styles.message}>Loading hotels...</p>
          )}

          {!isLoading && error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && hotels.length === 0 && (
            <div className={styles.emptyState}>
              <h3>No hotels available yet</h3>
              <p>Add your first hotel to display it here.</p>
              <Link
                to="/admin/hotels/add"
                className={styles.addButton}
              >
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

                    <p className={styles.description}>
                      {hotel.description}
                    </p>

                    <div className={styles.cardFooter}>
                      <div>
                        <strong>
                          {formatPrice(hotel.price_per_night)}
                        </strong>
                        <span className={styles.perNight}> / night</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ViewHotels;
