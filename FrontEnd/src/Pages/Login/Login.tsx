
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";

import type { RootState, AppDispatch } from "../../Store/store";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button";

import {
  login,
  setLoginEmail,
  setLoginPassword,
} from "../../ReduxSlice/LoginSlice";

import styles from "./Login.module.css";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { email, password, isLoading, error } = useSelector(
    (state: RootState) => state.login,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await dispatch(
        login({ email, password }),
      ).unwrap();

      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch {
      // The Redux slice stores the error message.
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.formCard}>
          <h1>Welcome Back</h1>

          <p className={styles.subtitle}>
            Log in to your Paradise account to continue your journey.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(value) => dispatch(setLoginEmail(value))}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(value) => dispatch(setLoginPassword(value))}
              required
            />

            {error && (
              <p className={styles.errorMessage}>{error}</p>
            )}

            <Button
              text={isLoading ? "Logging in..." : "Login"}
              type="submit"
              disabled={isLoading}
            />
          </form>

          <p className={styles.signupText}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.signupLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
