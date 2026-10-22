
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brandSection}>
          <Link to="/" className={styles.logo}>
            Paradise
          </Link>

          <p>
            Find your perfect stay and make every journey memorable.
          </p>
        </div>

        <div className={styles.linksSection}>
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

        <div className={styles.contactSection}>
          <h3>Contact</h3>
          <p>Email: support@paradise.example</p>
          <p>We're here to help with your booking journey.</p>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>
          © {new Date().getFullYear()} Paradise. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;