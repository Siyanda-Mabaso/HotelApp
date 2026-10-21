import {createAsyncThunk,createSlice,type PayloadAction,} from "@reduxjs/toolkit";
import axios from "axios";

export interface SignUpState {
  name: string;
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SignUpState = {
  name: "",
  email: "",
  password: "",
  isLoading: false,
  error: null,
  success: false,
};

export const signup = createAsyncThunk(
  "signup",
  async (userData: SignUpState) => {
    const response = await axios.post(
     "http://localhost:3000/api/register",
      {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    );

    return response.data;
  },
);

const SignUpSlice = createSlice({
  name: "signup",
  initialState,

  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },

    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },

    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },

    resetForm(state) {
      Object.assign(state, initialState);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;

        if (axios.isAxiosError(action.error)) {
          state.error =
            (action.payload as string | undefined) ||
            action.error.message ||
            "Signup failed";
        } else {
          state.error = action.error.message || "Signup failed";
        }
      });
  },
});

export const {
  setName,
  setEmail,
  setPassword,
  resetForm,
} = SignUpSlice.actions;

export default SignUpSlice.reducer;