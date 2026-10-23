
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./Home.module.css";

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

const Home = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get("/api/hotels");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.hotels;

        if (Array.isArray(data)) {
          setHotels(data);
        } else {
          setError("Unable to read the hotel listings.");
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

    void fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return hotels;

    return hotels.filter((hotel) =>
      `${hotel.name} ${hotel.city} ${hotel.country} ${hotel.address}`
        .toLowerCase()
        .includes(searchText),
    );
  }, [hotels, search]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>WELCOME TO PARADISE</p>

            <h1>Find your perfect place to stay.</h1>

            <p className={styles.heroText}>
              Discover comfortable stays, explore new destinations, and
              find the right accommodation for your next trip.
            </p>

            <a href="#hotel-listings" className={styles.heroButton}>
              Explore Hotels
            </a>
          </div>
        </section>

        <section className={styles.listings} id="hotel-listings">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>EXPLORE OUR COLLECTION</p>
              <h2>Discover Hotels</h2>
              <p className={styles.sectionText}>
                Find a stay that suits your next adventure.
              </p>
            </div>

            <span className={styles.hotelCount}>
              {filteredHotels.length}{" "}
              {filteredHotels.length === 1 ? "hotel" : "hotels"}
            </span>
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by hotel name, city or country..."
              aria-label="Search hotels by name, city or country"
            />
          </div>

          {isLoading && (
            <p className={styles.statusMessage}>Loading hotels...</p>
          )}

          {!isLoading && error && (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && filteredHotels.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">
                ⌂
              </span>

              <h3>
                {hotels.length === 0
                  ? "No hotels available yet"
                  : "No hotels found"}
              </h3>

              <p>
                {hotels.length === 0
                  ? "Our accommodation listings will appear here once hotels have been added."
                  : "Try another hotel name or destination."}
              </p>

              {search && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredHotels.length > 0 && (
            <div className={styles.hotelGrid}>
              {filteredHotels.map((hotel) => (
                <article className={styles.hotelCard} key={hotel.id}>
                  <div className={styles.hotelImage}>
                    <span className={styles.imageIcon} aria-hidden="true">
                      ⌂
                    </span>
                    <span className={styles.imageLabel}>
                      PARADISE STAYS
                    </span>
                  </div>

                  <div className={styles.hotelInfo}>
                    <div className={styles.hotelTitleRow}>
                      <h3>{hotel.name}</h3>

                      <span className={styles.rating}>
                        ★ {hotel.star_rating}
                      </span>
                    </div>

                    <p className={styles.location}>
                      <span aria-hidden="true">⌖</span>{" "}
                      {hotel.city}, {hotel.country}
                    </p>

                    <p className={styles.description}>
                      {hotel.description}
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.price}>
                        <strong>
                          R
                          {Number(hotel.price_per_night).toLocaleString(
                            "en-ZA",
                          )}
                        </strong>
                        <span> / night</span>
                      </div>

                      <Link
                        to={`/hotels/${hotel.id}`}
                        className={styles.detailsButton}
                        state={{ hotel }}
                      >
                        View Details
                      </Link>
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

export default Home;
