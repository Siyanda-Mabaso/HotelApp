import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../Store/store";
import {
  fetchFavourites,
  addFavourite,
  removeFavourite,
} from "../../ReduxSlice/favouriteSlice";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./HotelDetails.module.css";

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

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { token } = useSelector((state: RootState) => state.login);

  const { favourites } = useSelector((state: RootState) => state.favourites);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favouriteMessage, setFavouriteMessage] = useState("");
  const [isSavingFavourite, setIsSavingFavourite] = useState(false);

  // Fetch hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      if (!id || !/^\d+$/.test(id)) {
        setError("Invalid hotel ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await axios.get(`/api/hotels/${id}`);
        const data = response.data?.hotel ?? response.data;

        if (!data || typeof data !== "object" || data.id == null) {
          setError("Hotel information could not be found.");
          return;
        }

        setHotel(data as Hotel);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.status === 404
              ? "Sorry, this hotel could not be found."
              : error.response?.data?.message ||
                  "Unable to load hotel details. Please try again.",
          );
        } else {
          setError("Something went wrong while loading hotel details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHotel();
  }, [id]);

  // Load the logged-in user's favourites
  useEffect(() => {
    if (token) {
      dispatch(fetchFavourites(token));
    }
  }, [dispatch, token]);

  // Check whether this hotel is already a favourite
  const isFavourite = hotel
    ? favourites.some((favourite) => favourite.hotel_id === hotel.id)
    : false;

  // Add or remove a favourite when the heart is clicked
  const handleFavouriteClick = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!hotel || isSavingFavourite) {
      return;
    }

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

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <Link to="/home" className={styles.backLink}>
          ← Back to Hotels
        </Link>

        {isLoading && (
          <p className={styles.statusMessage}>Loading hotel details...</p>
        )}

        {!isLoading && error && (
          <section className={styles.messageCard}>
            <h1>Hotel unavailable</h1>
            <p>{error}</p>
            <Link to="/home" className={styles.primaryButton}>
              Browse Hotels
            </Link>
          </section>
        )}

        {!isLoading && !error && hotel && (
          <>
            <section className={styles.heroImage}>
              <span className={styles.heroIcon} aria-hidden="true">
                ⌂
              </span>

              <span className={styles.imageLabel}>PARADISE STAYS</span>
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
                  {/* Heart-only favourites button */}
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
