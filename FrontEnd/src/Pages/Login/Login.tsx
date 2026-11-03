
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { GoogleLogin } from "@react-oauth/google";

import type { RootState, AppDispatch } from "../../Store/store";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button";

import {
  login,
  googleLogin,
  setLoginEmail,
  setLoginPassword,
  setLoginError,
} from "../../ReduxSlice/LoginSlice";

import styles from "./Login.module.css";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [googleError, setGoogleError] = useState<string | null>(null);

  const { email, password, isLoading, error } = useSelector(
    (state: RootState) => state.login,
  );

  const handleNavigation = (role: string) => {
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  // Normal email and password login
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGoogleError(null);

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      handleNavigation(result.user.role);
    } catch {
      // Redux stores the error message.
    }
  };

  // Google login
  const handleGoogleSuccess = async (response: { credential?: string }) => {
    setGoogleError(null);
    dispatch(setLoginError(""));

    if (!response.credential) {
      setGoogleError("Google did not return a login credential.");
      return;
    }

    try {
      const result = await dispatch(
        googleLogin(response.credential),
      ).unwrap();

      handleNavigation(result.user.role);
    } catch {
      // Redux stores the backend error message.
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

            {googleError && (
              <p className={styles.errorMessage}>{googleError}</p>
            )}

            <Button
              text={isLoading ? "Logging in..." : "Login"}
              type="submit"
              disabled={isLoading}
            />
          </form>

          <div className={styles.googleSection}>
            <p>Or continue with</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setGoogleError(
                  "Google sign-in failed. Please try again.",
                )
              }
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

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
