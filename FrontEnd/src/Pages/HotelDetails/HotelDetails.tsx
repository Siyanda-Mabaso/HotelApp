import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";

import { fetchHotelById, clearHotelError } from "../../ReduxSlice/hotelSlice";

import { fetchHotelImages, type HotelImage } from "../../ReduxSlice/imageSlice";

import {
  fetchFavourites,
  addFavourite,
  removeFavourite,
} from "../../ReduxSlice/favouriteSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./HotelDetails.module.css";

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { token } = useSelector((state: RootState) => state.login);

  const { favourites } = useSelector((state: RootState) => state.favourites);

  const { hotels, selectedHotel, isHotelLoading, hotelError } = useSelector(
    (state: RootState) => state.hotels,
  );

  const [favouriteMessage, setFavouriteMessage] = useState("");
  const [isSavingFavourite, setIsSavingFavourite] = useState(false);

  const [hotelImages, setHotelImages] = useState<HotelImage[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const validHotelId = Boolean(id && /^\d+$/.test(id) && Number(id) > 0);

  const hotel =
    selectedHotel?.id === Number(id)
      ? selectedHotel
      : (hotels.find((item) => item.id === Number(id)) ?? null);

  // Load hotel details.
  useEffect(() => {
    if (!validHotelId || !id) return;

    void dispatch(fetchHotelById(id));
  }, [dispatch, id, validHotelId]);

  // Load the gallery for the current hotel.
  useEffect(() => {
    if (!validHotelId || !id) {
      setHotelImages([]);
      setIsImagesLoading(false);
      return;
    }

    let cancelled = false;

    const loadHotelImages = async () => {
      setIsImagesLoading(true);
      setHotelImages([]);

      try {
        const images = await dispatch(fetchHotelImages(Number(id))).unwrap();

        if (!cancelled) {
          setHotelImages(images);
        }
      } catch {
        if (!cancelled) {
          setHotelImages([]);
        }
      } finally {
        if (!cancelled) {
          setIsImagesLoading(false);
        }
      }
    };

    void loadHotelImages();

    return () => {
      cancelled = true;
    };
  }, [dispatch, id, validHotelId]);

  // Load favourites for the logged-in user.
  useEffect(() => {
    if (token) {
      void dispatch(fetchFavourites(token));
    }
  }, [dispatch, token]);

  const isFavourite = hotel
    ? favourites.some((favourite) => favourite.hotel_id === hotel.id)
    : false;

  const handleFavouriteClick = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!hotel || isSavingFavourite) return;

    setIsSavingFavourite(true);
    setFavouriteMessage("");

    try {
      if (isFavourite) {
        await dispatch(
          removeFavourite({
            hotelId: hotel.id,
            token,
          }),
        ).unwrap();

        setFavouriteMessage("Hotel removed from favourites.");
      } else {
        await dispatch(
          addFavourite({
            hotelId: hotel.id,
            token,
          }),
        ).unwrap();

        setFavouriteMessage("Hotel added to favourites.");
      }
    } catch (error) {
      setFavouriteMessage(
        typeof error === "string"
          ? error
          : "Unable to update favourites. Please try again.",
      );
    } finally {
      setIsSavingFavourite(false);
    }
  };

  const handleRetry = () => {
    if (id && validHotelId) {
      dispatch(clearHotelError());
      void dispatch(fetchHotelById(id));
    }
  };

  if (!validHotelId) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.main}>
          <section className={styles.messageCard}>
            <h1>Hotel unavailable</h1>
            <p>Invalid hotel ID.</p>

            <Link to="/home" className={styles.primaryButton}>
              Browse Hotels
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <Link to="/home" className={styles.backLink}>
          ← Back to Hotels
        </Link>

        {isHotelLoading && !hotel && (
          <p className={styles.statusMessage} role="status">
            Loading hotel details...
          </p>
        )}

        {!isHotelLoading && hotelError && (
          <section className={styles.messageCard}>
            <h1>Hotel unavailable</h1>
            <p role="alert">{hotelError}</p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRetry}
            >
              Try Again
            </button>

            <Link to="/home" className={styles.primaryButton}>
              Browse Hotels
            </Link>
          </section>
        )}

        {!isHotelLoading && !hotelError && !hotel && (
          <section className={styles.messageCard}>
            <h1>Hotel unavailable</h1>
            <p>Hotel information could not be found. Please try again.</p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRetry}
            >
              Try Again
            </button>

            <Link to="/home" className={styles.primaryButton}>
              Browse Hotels
            </Link>
          </section>
        )}

        {hotel && !hotelError && (
          <>
            {/* HOTEL PHOTO GALLERY */}
            <section
              className={styles.heroImage}
              aria-label={`${hotel.name} photo gallery`}
            >
              {isImagesLoading ? (
                <p className={styles.statusMessage} role="status">
                  Loading hotel photos...
                </p>
              ) : hotelImages.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      hotelImages.length === 1
                        ? "1fr"
                        : "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                    width: "100%",
                    height: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                    overflowY: "auto",
                  }}
                >
                  {hotelImages.map((image) => (
                    <img
                      key={image.id}
                      src={image.image_url}
                      alt={`${hotel.name} accommodation`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <span className={styles.heroIcon} aria-hidden="true">
                    ⌂
                  </span>

                  <span className={styles.imageLabel}>PARADISE STAYS</span>
                </>
              )}
            </section>

            <section className={styles.detailsCard}>
              <div className={styles.titleRow}>
                <div>
                  <p className={styles.eyebrow}>YOUR NEXT GETAWAY</p>

                  <h1>{hotel.name}</h1>

                  <p className={styles.location}>
                    <span aria-hidden="true">⌖</span> {hotel.address},{" "}
                    {hotel.city}, {hotel.country}
                  </p>
                </div>

                <div className={styles.rating}>
                  <span aria-hidden="true">★</span> {hotel.star_rating} / 5
                </div>
              </div>

              <hr className={styles.divider} />

              <section className={styles.infoSection}>
                <h2>About this accommodation</h2>
                <p className={styles.description}>{hotel.description}</p>
              </section>

              <section className={styles.priceSection}>
                <div>
                  <p className={styles.priceLabel}>Price per night</p>

                  <p className={styles.price}>
                    R{Number(hotel.price_per_night).toLocaleString("en-ZA")}
                    <span> / night</span>
                  </p>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={`${styles.favouriteButton} ${
                      isFavourite ? styles.favouriteActive : ""
                    }`}
                    onClick={handleFavouriteClick}
                    disabled={isSavingFavourite}
                    aria-label={
                      isFavourite
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                    aria-pressed={isFavourite}
                    title={
                      isFavourite
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                  >
                    {isSavingFavourite ? "…" : isFavourite ? "♥" : "♡"}
                  </button>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate(`/hotels/${hotel.id}/book`)}
                  >
                    Book This Hotel
                  </button>
                </div>
              </section>

              {favouriteMessage && (
                <p className={styles.favouriteMessage} role="status">
                  {favouriteMessage}
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HotelDetails;
