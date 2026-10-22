
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

// User information returned by the backend
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Data sent to the backend during login
interface LoginData {
  email: string;
  password: string;
}

// Login state managed by Redux
interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  token: string | null;
  user: User | null;
}

const initialState: LoginState = {
  email: "",
  password: "",
  isLoading: false,
  error: null,
  success: false,
  token: null,
  user: null,
};

// Send login details to the backend
export const login = createAsyncThunk<
  { token: string; user: User },
  LoginData,
  { rejectValue: string }
>(
  "login/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/login", {
        email: loginData.email,
        password: loginData.password,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Login failed. Please check your details and try again."
        );
      }

      return rejectWithValue("Something went wrong. Please try again.");
    }
  }
);

const LoginSlice = createSlice({
  name: "login",
  initialState,

  reducers: {
    setLoginEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },

    setLoginPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },

    resetLoginForm(state) {
      state.email = "";
      state.password = "";
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },

    logout(state) {
      state.email = "";
      state.password = "";
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.token = null;
      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.password = "";
      })

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error =
          action.payload || action.error.message || "Login failed.";
      });
  },
});

export const {
  setLoginEmail,
  setLoginPassword,
  resetLoginForm,
  logout,
} = LoginSlice.actions;

export default LoginSlice.reducer;
