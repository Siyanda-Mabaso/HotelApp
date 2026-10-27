
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../../Store/store";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import styles from "./Profile.module.css";

const Profile = () => {
  const user = useSelector((state: RootState) => state.login.user);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.heading}>
          <p className={styles.eyebrow}>YOUR PARADISE ACCOUNT</p>
          <h1>My Profile</h1>
          <p>Manage your personal information and favourite hotels.</p>
        </section>

        <section className={styles.profileCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className={styles.userInfo}>
            <h2>{user?.name || "Guest User"}</h2>
            <p>{user?.email || "No email available"}</p>
            <span className={styles.role}>
              {user?.role || "Customer"}
            </span>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>My Favourites</h2>
              <p>Hotels you have saved for a future stay.</p>
            </div>
            <span className={styles.heart}>♡</span>
          </div>

          <div className={styles.empty}>
            <span className={styles.emptyHeart}>♡</span>
            <h3>No favourite hotels yet</h3>
            <p>
              Save hotels you love and they will appear here.
            </p>
            <Link to="/home" className={styles.button}>
              Explore hotels
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>My Bookings</h2>
              <p>View and manage your reservations.</p>
            </div>
            <Link to="/my-bookings" className={styles.textLink}>
              View bookings →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
