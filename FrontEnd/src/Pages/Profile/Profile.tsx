
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../Store/store";
import {
    fetchFavourites,
    removeFavourite,
} from "../../ReduxSlice/favouriteSlice"
import styles from "./Profile.module.css";

function Profile() {
    const dispatch = useDispatch<AppDispatch>();

    const { token, user } = useSelector(
        (state: RootState) => state.login
    );

    const { favourites, isLoading, error } = useSelector(
        (state: RootState) => state.favourites
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
            <main className={styles.profile}>
                <h1>My Profile</h1>
                <p>Please log in to view your profile and favourites.</p>
                <Link to="/login">Go to Login</Link>
            </main>
        );
    }

    return (
        <main className={styles.profile}>
            <section className={styles.profileCard}>
                <h1>My Profile</h1>

                <div className={styles.userDetails}>
                    <p>
                        <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Role:</strong> {user.role}
                    </p>
                </div>

                <Link to="/my-bookings" className={styles.bookingsLink}>
                    View My Bookings
                </Link>
            </section>

            <section className={styles.favouritesSection}>
                <h2>My Favourite Hotels</h2>
                <p>Hotels you save will appear here.</p>

                {isLoading && <p>Loading your favourites...</p>}

                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                {!isLoading && !error && favourites.length === 0 && (
                    <p>You have not saved any favourite hotels yet.</p>
                )}

                <div className={styles.favouritesGrid}>
                    {favourites.map((favourite) => (
                        <article
                            key={favourite.id}
                            className={styles.favouriteCard}
                        >
                            <div className={styles.hotelInfo}>
                                <h3>{favourite.hotel_name}</h3>

                                <p>
                                    {favourite.city}, {favourite.country}
                                </p>

                                <p>{favourite.address}</p>

                                <p>
                                    ⭐ {favourite.star_rating} stars
                                </p>

                                <p>
                                    R{Number(favourite.price_per_night).toFixed(2)}
                                    {" "}per night
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
                                    onClick={() =>
                                        handleRemoveFavourite(favourite.hotel_id)
                                    }
                                    className={styles.removeButton}
                                >
                                    Remove Favourite
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Profile;
