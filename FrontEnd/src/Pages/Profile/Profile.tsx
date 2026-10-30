import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../Store/store";
import {
  fetchMyProfile,
  updateMyProfile,
  clearProfileMessages,
} from "../../ReduxSlice/profileSlice";
import {
  fetchFavourites,
  removeFavourite,
} from "../../ReduxSlice/favouriteSlice";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Button from "../../Components/Button/Button";
import styles from "./Profile.module.css";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { profile, isLoading, isUpdating, error, success } = useSelector(
    (state: RootState) => state.profile,
  );

  const {
    favourites,
    isLoading: favouritesLoading,
    error: favouritesError,
  } = useSelector((state: RootState) => state.favourites);

  const token = useSelector((state: RootState) => state.login.token);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(fetchMyProfile());

    if (token) {
      dispatch(fetchFavourites(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleEdit = () => {
    dispatch(clearProfileMessages());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setIsEditing(false);
    dispatch(clearProfileMessages());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearProfileMessages());

    const result = await dispatch(
      updateMyProfile({
        name: name.trim(),
        email: email.trim(),
      }),
    );

    if (updateMyProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleRemoveFavourite = async (hotelId: number) => {
    if (!token) return;

    await dispatch(removeFavourite({ hotelId, token }));
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.profileCard}>
          <div className={styles.heading}>
            <div className={styles.avatar}>
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <h1>My Profile</h1>
            <p>Manage your Paradise account information.</p>
          </div>

          {isLoading && <p className={styles.info}>Loading your profile...</p>}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className={styles.success} role="status">
              {success}
            </p>
          )}

          {!isLoading && profile && (
            <>
              {!isEditing ? (
                <div className={styles.details}>
                  <div className={styles.detail}>
                    <span>Full name</span>
                    <strong>{profile.name}</strong>
                  </div>

                  <div className={styles.detail}>
                    <span>Email address</span>
                    <strong>{profile.email}</strong>
                  </div>

                  <div className={styles.detail}>
                    <span>Account type</span>
                    <strong className={styles.role}>{profile.role}</strong>
                  </div>

                  <div className={styles.detail}>
                    <span>Member since</span>
                    <strong>
                      {new Date(profile.created_at).toLocaleDateString(
                        "en-ZA",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </strong>
                  </div>

                  <div className={styles.actions}>
                    <Button text="Edit Profile" onClick={handleEdit} />
                  </div>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={255}
                  />

                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={255}
                  />

                  <div className={styles.actions}>
                    <Button
                      text={isUpdating ? "Saving..." : "Save Changes"}
                      type="submit"
                      disabled={isUpdating}
                    />

                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancel}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>

        {/* My Favourites */}
        <section
          style={{
            marginTop: "30px",
            padding: "25px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>My Favourites</h2>
          <p>Hotels you have saved for later.</p>

          {favouritesLoading && <p>Loading your favourite hotels...</p>}

          {favouritesError && (
            <p role="alert" style={{ color: "red" }}>
              {favouritesError}
            </p>
          )}

          {!favouritesLoading &&
            !favouritesError &&
            favourites.length === 0 && (
              <p>You have not saved any favourite hotels yet.</p>
            )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {favourites.map((favourite) => (
              <article
                key={favourite.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "18px",
                }}
              >
                <h3>{favourite.hotel_name}</h3>

                <p>
                  {favourite.city}, {favourite.country}
                </p>

                <p>{favourite.address}</p>

                <p>
                  {"★".repeat(
                    Math.max(
                      0,
                      Math.min(5, Number(favourite.star_rating) || 0),
                    ),
                  )}
                  {"☆".repeat(
                    5 -
                      Math.max(
                        0,
                        Math.min(5, Number(favourite.star_rating) || 0),
                      ),
                  )}
                </p>

                <p>
                  <strong>
                    R{Number(favourite.price_per_night).toLocaleString("en-ZA")}
                  </strong>{" "}
                  per night
                </p>

                <div className={styles.favouriteActions}>
                  <button
                    type="button"
                    className={styles.viewHotelButton}
                    onClick={() =>
                      window.location.assign(`/hotels/${favourite.hotel_id}`)
                    }
                  >
                    View Hotel
                  </button>

                  <button
                    type="button"
                    className={styles.removeFavouriteButton}
                    disabled={favouritesLoading}
                    onClick={() =>
                      handleRemoveFavourite(favourite.hotel_id)
                    }
                  >
                    Remove Favourite
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
