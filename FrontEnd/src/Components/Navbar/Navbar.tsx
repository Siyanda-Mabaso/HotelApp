
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../Store/store";
import { logout } from "../../ReduxSlice/LoginSlice";
import Button from "../Button/Button";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { token, user } = useSelector(
    (state: RootState) => state.login
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isLoggedIn = Boolean(token && user);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        Paradise
      </Link>

      <div className={styles.navLinks}>
        <Link to="/" className={styles.link}>
          Home
        </Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login" className={styles.link}>
              Login
            </Link>

            <Link to="/signup" className={styles.signupButton}>
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {user?.role === "admin" ? (
              <Link to="/admin" className={styles.link}>
                Admin Dashboard
              </Link>
            ) : (
              <>
                <Link to="/my-bookings" className={styles.link}>
                  My Bookings
                </Link>

                <Link to="/profile" className={styles.link}>
                  My Profile
                </Link>
              </>
            )}

            <Button
              text="Logout"
              onClick={handleLogout}
            />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
