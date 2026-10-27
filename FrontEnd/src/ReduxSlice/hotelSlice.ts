import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  price_per_night: number;
}

export type HotelInput = Omit<Hotel, "id">;

interface UpdateHotelPayload {
  id: number;
  hotel: HotelInput;
  token: string;
}

interface HotelRequest {
  token: string;
}

interface DeleteHotelPayload extends HotelRequest {
  id: number;
}

interface HotelState {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  isLoading: boolean;
  error: string | null;
  isHotelLoading: boolean;
  hotelError: string | null;
  isSaving: boolean;
  mutationError: string | null;
  currentHotelRequestId: string | null;
}

const initialState: HotelState = {
  hotels: [],
  selectedHotel: null,
  isLoading: false,
  error: null,
  isHotelLoading: false,
  hotelError: null,
  isSaving: false,
  mutationError: null,
  currentHotelRequestId: null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const getHotel = (data: unknown): Hotel | null => {
  if (!data || typeof data !== "object") return null;

  const response = data as { hotel?: Hotel };
  const hotel = response.hotel ?? (data as Hotel);

  return hotel && typeof hotel.id === "number" ? hotel : null;
};

// Fetch all hotels
export const fetchHotels = createAsyncThunk<
  Hotel[],
  void,
  { rejectValue: string }
>("hotels/fetchHotels", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/hotels");
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.hotels;

    if (!Array.isArray(data)) {
      return rejectWithValue("Unable to read the hotel listings.");
    }

    return data as Hotel[];
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to load hotels. Please try again."),
    );
  }
});

// Fetch one hotel
export const fetchHotelById = createAsyncThunk<
  Hotel,
  string,
  { rejectValue: string }
>("hotels/fetchHotelById", async (id, { rejectWithValue }) => {
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return rejectWithValue("Invalid hotel ID.");
  }

  try {
    const response = await axios.get(`/api/hotels/${id}`);
    const hotel = getHotel(response.data);

    if (!hotel || hotel.id !== Number(id)) {
      return rejectWithValue("Hotel information could not be found.");
    }

    return hotel;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return rejectWithValue("Sorry, this hotel could not be found.");
    }

    return rejectWithValue(
      getErrorMessage(error, "Unable to load hotel details. Please try again."),
    );
  }
});

// Admin: add a hotel
export const createHotel = createAsyncThunk<
  Hotel,
  HotelInput & HotelRequest,
  { rejectValue: string }
>(
  "hotels/createHotel",
  async ({ token, ...hotelData }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/hotels", hotelData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const hotel = getHotel(response.data);

      if (!hotel) {
        return rejectWithValue("The server did not return the new hotel.");
      }

      return hotel;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to add the hotel."),
      );
    }
  },
);

// Admin: update a hotel
export const updateHotel = createAsyncThunk<
  Hotel,
  UpdateHotelPayload,
  { rejectValue: string }
>("hotels/updateHotel", async ({ id, hotel, token }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/hotels/${id}`, hotel, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedHotel = getHotel(response.data);

    if (!updatedHotel) {
      return rejectWithValue("The server did not return the updated hotel.");
    }

    return updatedHotel;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to update the hotel."),
    );
  }
});

// Admin: delete a hotel
export const deleteHotel = createAsyncThunk<
  number,
  DeleteHotelPayload,
  { rejectValue: string }
>("hotels/deleteHotel", async ({ id, token }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/hotels/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return id;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to delete the hotel."),
    );
  }
});

const hotelSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    clearHotelError: (state) => {
      state.error = null;
      state.hotelError = null;
      state.mutationError = null;
    },
    setSelectedHotel: (state, action: { payload: Hotel | null }) => {
      state.selectedHotel = action.payload;
      state.hotelError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all hotels
      .addCase(fetchHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload;
        state.error = null;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Unable to load hotels. Please try again.";
      })

      // Fetch one hotel; ignore stale requests
      .addCase(fetchHotelById.pending, (state, action) => {
        state.isHotelLoading = true;
        state.hotelError = null;
        state.selectedHotel = null;
        state.currentHotelRequestId = action.meta.requestId;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        if (state.currentHotelRequestId !== action.meta.requestId) return;

        state.isHotelLoading = false;
        state.selectedHotel = action.payload;
        state.hotelError = null;
        state.currentHotelRequestId = null;

        const index = state.hotels.findIndex(
          (hotel) => hotel.id === action.payload.id,
        );

        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        if (state.currentHotelRequestId !== action.meta.requestId) return;

        state.isHotelLoading = false;
        state.hotelError = action.payload || "Unable to load hotel details.";
        state.currentHotelRequestId = null;
      })

      // Add a hotel
      .addCase(createHotel.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.isSaving = false;
        state.hotels.push(action.payload);
        state.mutationError = null;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Unable to add the hotel.";
      })

      // Update a hotel
      .addCase(updateHotel.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isSaving = false;
        state.mutationError = null;

        const index = state.hotels.findIndex(
          (hotel) => hotel.id === action.payload.id,
        );

        if (index !== -1) {
          state.hotels[index] = action.payload;
        }

        if (state.selectedHotel?.id === action.payload.id) {
          state.selectedHotel = action.payload;
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Unable to update the hotel.";
      })

      // Delete a hotel
      .addCase(deleteHotel.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.isSaving = false;
        state.mutationError = null;
        state.hotels = state.hotels.filter(
          (hotel) => hotel.id !== action.payload,
        );

        if (state.selectedHotel?.id === action.payload) {
          state.selectedHotel = null;
        }
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Unable to delete the hotel.";
      });
  },
});

export const { clearHotelError, setSelectedHotel } = hotelSlice.actions;

export default hotelSlice.reducer;
