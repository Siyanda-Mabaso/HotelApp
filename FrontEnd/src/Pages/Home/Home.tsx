import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";
import { fetchHotels } from "../../ReduxSlice/hotelSlice";
import { fetchHotelImages, type HotelImage } from "../../ReduxSlice/imageSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./Home.module.css";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { hotels, isLoading, error } = useSelector(
    (state: RootState) => state.hotels,
  );

  const [search, setSearch] = useState("");
  const [hotelImages, setHotelImages] = useState<Record<number, HotelImage[]>>(
    {},
  );

  // Fetch hotels.
  useEffect(() => {
    void dispatch(fetchHotels());
  }, [dispatch]);

  // Fetch images belonging to each hotel.
  useEffect(() => {
    if (hotels.length === 0) {
      setHotelImages({});
      return;
    }

    let cancelled = false;

    const loadImages = async () => {
      const results = await Promise.all(
        hotels.map(async (hotel) => {
          try {
            const images = await dispatch(fetchHotelImages(hotel.id)).unwrap();

            return [hotel.id, images] as const;
          } catch {
            return [hotel.id, [] as HotelImage[]] as const;
          }
        }),
      );

      if (!cancelled) {
        const imageMap: Record<number, HotelImage[]> = {};

        results.forEach(([hotelId, images]) => {
          imageMap[hotelId] = images;
        });

        setHotelImages(imageMap);
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [dispatch, hotels]);

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
              Discover comfortable stays, explore new destinations, and find the
              right accommodation for your next trip.
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
                onClick={() => void dispatch(fetchHotels())}
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
              {filteredHotels.map((hotel) => {
                const firstImage = hotelImages[hotel.id]?.[0];

                return (
                  <article className={styles.hotelCard} key={hotel.id}>
                    <div
                      className={styles.hotelImage}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {firstImage ? (
                        <img
                          src={firstImage.image_url}
                          alt={hotel.name}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className={styles.imageIcon} aria-hidden="true">
                          ⌂
                        </span>
                      )}

                      <span
                        className={styles.imageLabel}
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                        }}
                      >
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
                        <span aria-hidden="true">⌖</span> {hotel.city},{" "}
                        {hotel.country}
                      </p>

                      <p className={styles.description}>{hotel.description}</p>

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
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
