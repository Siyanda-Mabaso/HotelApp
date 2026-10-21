
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import type { RootState, AppDispatch } from "../../Store/store";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button";

import {
  signup,
  setName,
  setEmail,
  setPassword,
} from "../../ReduxSlice/SignUpSlice";

import styles from "./SignUp.module.css";

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { name, email, password, isLoading, error, success } =
    useSelector((state: RootState) => state.signUp);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(
      signup({
        name,
        email,
        password,
        isLoading,
        error,
        success,
      }),
    );
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.formCard}>
          <h1>Create Account</h1>
          <p className={styles.subtitle}>
            Join Paradise and discover your perfect stay.
          </p>

          {success ? (
            <div className={styles.successMessage}>
              <h2>Registration Successful!</h2>
              <p>Your Paradise account has been created.</p>
              <Link to="/login" className={styles.loginLink}>
                Continue to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(value) => dispatch(setName(value))}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(value) => dispatch(setEmail(value))}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password (minimum 8 characters)"
                value={password}
                onChange={(value) => dispatch(setPassword(value))}
                required
              />

              {error && (
                <p className={styles.errorMessage}>{error}</p>
              )}

              <Button
                text={isLoading ? "Creating Account..." : "Sign Up"}
                type="submit"
                disabled={isLoading}
              />
            </form>
          )}

          {!success && (
            <p className={styles.loginText}>
              Already have an account?{" "}
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;