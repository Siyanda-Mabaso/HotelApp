import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthData {
  token: string;
  user: User;
}

interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  token: string | null;
  user: User | null;
}

const STORAGE_KEY = "paradiseAuth";

const getSavedAuth = (): AuthData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("token" in parsed) ||
      !("user" in parsed)
    ) {
      return null;
    }

    const auth = parsed as AuthData;

    if (
      typeof auth.token !== "string" ||
      !auth.token ||
      !auth.user ||
      typeof auth.user.id !== "number" ||
      typeof auth.user.role !== "string"
    ) {
      return null;
    }

    return auth;
  } catch {
    return null;
  }
};

const initialAuth = getSavedAuth();

const initialState: LoginState = {
  email: "",
  password: "",
  isLoading: false,
  error: null,
  success: false,
  token: initialAuth?.token ?? null,
  user: initialAuth?.user ?? null,
};

export const login = createAsyncThunk<
  AuthData,
  LoginData,
  { rejectValue: string }
>("login/login", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/login", loginData);

    const authData = response.data as AuthData;

    if (!authData.token || !authData.user) {
      return rejectWithValue("The server returned invalid login data.");
    }

    // Persist authentication after a successful login.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    return authData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Login failed. Please check your details and try again.",
      );
    }

    return rejectWithValue("Something went wrong during login.");
  }
});

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setLoginEmail: (state, action: { payload: string }) => {
      state.email = action.payload;
    },

    setLoginPassword: (state, action: { payload: string }) => {
      state.password = action.payload;
    },

    resetLoginForm: (state) => {
      state.email = "";
      state.password = "";
      state.error = null;
      state.success = false;
    },

    logout: (state) => {
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
        state.error = action.payload || "Unable to log in. Please try again.";
      });
  },
});

export const { setLoginEmail, setLoginPassword, resetLoginForm, logout } =
  loginSlice.actions;

export default loginSlice.reducer;
