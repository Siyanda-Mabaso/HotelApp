
import { Link } from "react-router-dom";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <h1>Welcome to Paradise</h1>
        <p>
          Discover your next stay. Our hotel listings will be available here
          soon.
        </p>

        <Link to="/login" className={styles.link}>
          Back to Login
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
