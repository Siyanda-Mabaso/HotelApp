
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface HotelImage {
  id: number;
  hotel_id: number;
  image_url: string;
  created_at?: string;
}

interface ImageState {
  images: HotelImage[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  mutationError: string | null;
}

interface AddImagePayload {
  hotelId: number;
  image_url: string;
  token: string;
}

interface DeleteImagePayload {
  imageId: number;
  token: string;
}

const initialState: ImageState = {
  images: [],
  isLoading: false,
  isSaving: false,
  error: null,
  mutationError: null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

// Fetch all images for one hotel
export const fetchHotelImages = createAsyncThunk<
  HotelImage[],
  number,
  { rejectValue: string }
>(
  "images/fetchHotelImages",
  async (hotelId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/hotels/${hotelId}/images`,
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.images;

      if (!Array.isArray(data)) {
        return rejectWithValue("Unable to read hotel images.");
      }

      return data as HotelImage[];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load hotel images."),
      );
    }
  },
);

// Admin: add an image URL to a hotel
export const addHotelImage = createAsyncThunk<
  HotelImage,
  AddImagePayload,
  { rejectValue: string }
>(
  "images/addHotelImage",
  async ({ hotelId, image_url, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/hotels/${hotelId}/images`,
        { image_url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const image = response.data?.image;

      if (!image || typeof image.id !== "number") {
        return rejectWithValue(
          "The server did not return the new image.",
        );
      }

      return image as HotelImage;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to add the hotel image."),
      );
    }
  },
);

// Admin: delete an image
export const deleteHotelImage = createAsyncThunk<
  number,
  DeleteImagePayload,
  { rejectValue: string }
>(
  "images/deleteHotelImage",
  async ({ imageId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return imageId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to delete the hotel image."),
      );
    }
  },
);

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    clearImageErrors: (state) => {
      state.error = null;
      state.mutationError = null;
    },
    clearHotelImages: (state) => {
      state.images = [];
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch images
      .addCase(fetchHotelImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload;
      })
      .addCase(fetchHotelImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Unable to load hotel images.";
      })

      // Add image
      .addCase(addHotelImage.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
      })
      .addCase(addHotelImage.fulfilled, (state, action) => {
        state.isSaving = false;

        const alreadyExists = state.images.some(
          (image) => image.id === action.payload.id,
        );

        if (!alreadyExists) {
          state.images.push(action.payload);
        }
      })
      .addCase(addHotelImage.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError =
          action.payload || "Unable to add the hotel image.";
      })

      // Delete image
      .addCase(deleteHotelImage.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
      })
      .addCase(deleteHotelImage.fulfilled, (state, action) => {
        state.isSaving = false;
        state.images = state.images.filter(
          (image) => image.id !== action.payload,
        );
      })
      .addCase(deleteHotelImage.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError =
          action.payload || "Unable to delete the hotel image.";
      });
  },
});

export const {
  clearImageErrors,
  clearHotelImages,
} = imageSlice.actions;

export default imageSlice.reducer;
