
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        Paradise
      </Link>

      <div className={styles.navLinks}>
        <Link to="/" className={styles.link}>
          Home
        </Link>

        <Link to="/login" className={styles.link}>
          Login
        </Link>

        <Link to="/signup" className={styles.signupButton}>
          Sign Up
        </Link>
        <Link to="/my-bookings">My Bookings</Link>
      </div>
    </nav>
  );
};

export default Navbar;