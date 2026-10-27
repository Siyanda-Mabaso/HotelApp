import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../Store/store";
import {
  fetchFavourites,
  removeFavourite,
} from "../../ReduxSlice/favouriteSlice";
import styles from "./Profile.module.css";

function Profile() {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.login);

  const { favourites, isLoading, error } = useSelector(
    (state: RootState) => state.favourites,
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchFavourites(token));
    }
  }, [dispatch, token]);

  const handleRemoveFavourite = (hotelId: number) => {
    if (token) {
      dispatch(removeFavourite({ hotelId, token }));
    }
  };

  if (!user || !token) {
    return (
      <main className={styles.page}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>PARADISE</span>
          <h1>My Profile</h1>
          <p>Manage your account and favourite hotels.</p>
        </div>

        <section className={styles.section}>
          <div className={styles.empty}>
            <h3>Please log in</h3>
            <p>Log in to view your profile and saved hotels.</p>
            <Link to="/login" className={styles.button}>
              Go to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>PARADISE ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Manage your account, bookings, and favourite hotels.</p>
      </div>

      {/* User profile */}
      <section className={styles.profileCard}>
        <div className={styles.avatar}>{initials || "U"}</div>

        <div className={styles.userInfo}>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className={styles.role}>{user.role}</span>
        </div>
      </section>

      {/* Booking link */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>My Bookings</h2>
            <p>View and manage your hotel reservations.</p>
          </div>
        </div>

        <Link to="/my-bookings" className={styles.button}>
          View My Bookings
        </Link>
      </section>

      {/* Favourite hotels */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>My Favourite Hotels</h2>
            <p>Your saved hotels, all in one place.</p>
          </div>

          <span className={styles.heart} aria-label="Favourites">
            ♥
          </span>
        </div>

        {isLoading && (
          <p className={styles.loading}>Loading your favourite hotels...</p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && favourites.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyHeart}>♡</div>
            <h3>No favourite hotels yet</h3>
            <p>Save hotels you love and they will appear here.</p>
            <Link to="/home" className={styles.button}>
              Explore Hotels
            </Link>
          </div>
        )}

        {!isLoading && favourites.length > 0 && (
          <div className={styles.favouritesGrid}>
            {favourites.map((favourite) => (
              <article key={favourite.id} className={styles.favouriteCard}>
                <div className={styles.hotelInfo}>
                  <h3>{favourite.hotel_name}</h3>

                  <p>
                    {favourite.city}, {favourite.country}
                  </p>

                  <p>{favourite.address}</p>

                  <p>⭐ {favourite.star_rating} stars</p>

                  <p className={styles.hotelPrice}>
                    R{Number(favourite.price_per_night).toFixed(2)}
                    <span> / night</span>
                  </p>
                </div>

                <div className={styles.cardActions}>
                  <Link
                    to={`/hotels/${favourite.hotel_id}`}
                    className={styles.viewHotelLink}
                  >
                    View Hotel
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemoveFavourite(favourite.hotel_id)}
                    className={styles.removeButton}
                    disabled={isLoading}
                  >
                    Remove Favourite
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
