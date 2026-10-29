import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../Store/store";
import {
  fetchMyProfile,
  updateMyProfile,
  clearProfileMessages,
} from "../../ReduxSlice/profileSlice";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Button from "../../Components/Button/Button";
import styles from "./Profile.module.css";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { profile, isLoading, isUpdating, error, success } = useSelector(
    (state: RootState) => state.profile,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

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
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
