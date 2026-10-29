import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Booking {
  id: number;
  user_id: number;
  hotel_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  rooms: number;
  guests: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at?: string;
}

export interface CreateBookingInput {
  hotel_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  rooms: number;
  guests: number;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
}

interface ThunkState {
  login: {
    token: string | null;
  };
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

// Get the logged-in user's token from Redux.
const getAuthToken = (state: ThunkState) => state.login.token;

// Create a booking.
export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingInput,
  { state: ThunkState; rejectValue: string }
>(
  "bookings/createBooking",
  async (bookingData, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState());

      if (!token) {
        return rejectWithValue("Please log in to make a booking.");
      }

      const response = await axios.post("/api/bookings", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.booking as Booking;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create booking.",
        );
      }

      return rejectWithValue("An unexpected error occurred.");
    }
  },
);

// Fetch all bookings for the logged-in user or according to backend permissions.
export const fetchBookings = createAsyncThunk<
  Booking[],
  void,
  { state: ThunkState; rejectValue: string }
>("bookings/fetchBookings", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());

    if (!token) {
      return rejectWithValue("Please log in to view bookings.");
    }

    const response = await axios.get("/api/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.bookings as Booking[];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings.",
      );
    }

    return rejectWithValue("An unexpected error occurred.");
  }
});

// Fetch one booking by ID.
export const fetchBookingById = createAsyncThunk<
  Booking,
  number,
  { state: ThunkState; rejectValue: string }
>(
  "bookings/fetchBookingById",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState());

      if (!token) {
        return rejectWithValue("Please log in to view this booking.");
      }

      const response = await axios.get(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.booking as Booking;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch booking details.",
        );
      }

      return rejectWithValue("An unexpected error occurred.");
    }
  },
);

// Cancel a booking.
export const cancelBooking = createAsyncThunk<
  Booking,
  number,
  { state: ThunkState; rejectValue: string }
>(
  "bookings/cancelBooking",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState());

      if (!token) {
        return rejectWithValue("Please log in to cancel a booking.");
      }

      const response = await axios.delete(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.booking as Booking;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to cancel booking.",
        );
      }

      return rejectWithValue("An unexpected error occurred.");
    }
  },
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearBookingSuccess: (state) => {
      state.successMessage = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedBooking = action.payload;

        const existingIndex = state.bookings.findIndex(
          (booking) => booking.id === action.payload.id,
        );

        if (existingIndex === -1) {
          state.bookings.unshift(action.payload);
        }

        state.successMessage = "Booking created successfully.";
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isSaving = false;
        state.error =
          action.payload || action.error.message || "Failed to create booking.";
      })

      // Fetch all bookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || action.error.message || "Failed to fetch bookings.";
      })

      // Fetch one booking
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch booking details.";
      })

      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedBooking = action.payload;

        state.bookings = state.bookings.map((booking) =>
          booking.id === action.payload.id ? action.payload : booking,
        );

        state.successMessage = "Booking cancelled successfully.";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isSaving = false;
        state.error =
          action.payload || action.error.message || "Failed to cancel booking.";
      });
  },
});

export const { clearBookingError, clearBookingSuccess, clearSelectedBooking } =
  bookingSlice.actions;

export default bookingSlice.reducer;
