
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

// Normal email and password login
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

// Google login
export const googleLogin = createAsyncThunk<
  AuthData,
  string,
  { rejectValue: string }
>("login/googleLogin", async (credential, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/google-login", {
      credential,
    });

    const authData = response.data as AuthData;

    if (!authData.token || !authData.user) {
      return rejectWithValue("The server returned invalid Google login data.");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    return authData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Google login failed. Please try again.",
      );
    }

    return rejectWithValue("Something went wrong during Google login.");
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
    setLoginError: (state, action: { payload: string }) => {
  state.error = action.payload;
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

      localStorage.removeItem(STORAGE_KEY);
    },
  },

  extraReducers: (builder) => {
    builder
      // Normal login
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
      })

      // Google login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.password = "";
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error =
          action.payload || "Unable to log in with Google. Please try again.";
      });
  },
});

export const {
  setLoginEmail,
  setLoginPassword,
  setLoginError,
  resetLoginForm,
  logout,
} = loginSlice.actions;

export default loginSlice.reducer;
