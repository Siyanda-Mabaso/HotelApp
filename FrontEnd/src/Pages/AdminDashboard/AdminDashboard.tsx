
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.welcomeSection}>
          <div>
            <p className={styles.eyebrow}>PARADISE MANAGEMENT</p>
            <h1>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Manage your accommodations on Paradise.
            </p>
          </div>

          <Link to="/admin/hotels/add" className={styles.addHotelLink}>
            + Add New Hotel
          </Link>
        </section>

        <section className={styles.managementSection}>
          <div>
            <h2>Hotel Management</h2>
            <p>
              Add new hotels or manage your existing accommodation listings.
            </p>
          </div>

          <div className={styles.actions}>
            <Link to="/admin/hotels/add" className={styles.actionLink}>
              <span className={styles.actionIcon}>＋</span>
              <span>
                <strong>Add a Hotel</strong>
                <small>Enter accommodation details</small>
              </span>
              <span className={styles.arrow}>→</span>
            </Link>

            <Link to="/admin/hotels" className={styles.actionLink}>
              <span className={styles.actionIcon}>☷</span>
              <span>
                <strong>View Hotels</strong>
                <small>Manage your hotel listings</small>
              </span>
              <span className={styles.arrow}>→</span>
            </Link>
          </div>

          <div className={styles.note}>
            <strong>Administrator access</strong>
            <p>
              Only administrators can add, edit, or delete hotel listings.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
