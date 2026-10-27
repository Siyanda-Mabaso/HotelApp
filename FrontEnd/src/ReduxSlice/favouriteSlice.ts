
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Favourite {
    id: number;
    user_id: number;
    hotel_id: number;
    created_at: string;
    hotel_name: string;
    address: string;
    city: string;
    country: string;
    price_per_night: number;
    star_rating: number;
}

interface FavouriteState {
    favourites: Favourite[];
    isLoading: boolean;
    error: string | null;
}

const initialState: FavouriteState = {
    favourites: [],
    isLoading: false,
    error: null,
};

// Fetch the logged-in user's favourites
export const fetchFavourites = createAsyncThunk<
    Favourite[],
    string,
    { rejectValue: string }
>(
    "favourites/fetchFavourites",
    async (token, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/favourites", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.favourites;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to load favourites."
                );
            }

            return rejectWithValue("An unexpected error occurred.");
        }
    }
);

// Add a hotel to favourites
export const addFavourite = createAsyncThunk<
    Favourite,
    { hotelId: number; token: string },
    { rejectValue: string }
>(
    "favourites/addFavourite",
    async ({ hotelId, token }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                "/api/favourites",
                { hotel_id: hotelId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.favourite;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to add favourite."
                );
            }

            return rejectWithValue("An unexpected error occurred.");
        }
    }
);

// Remove a hotel from favourites
export const removeFavourite = createAsyncThunk<
    number,
    { hotelId: number; token: string },
    { rejectValue: string }
>(
    "favourites/removeFavourite",
    async ({ hotelId, token }, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/favourites/${hotelId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return hotelId;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to remove favourite."
                );
            }

            return rejectWithValue("An unexpected error occurred.");
        }
    }
);

const favouriteSlice = createSlice({
    name: "favourites",
    initialState,
    reducers: {
        clearFavourites: (state) => {
            state.favourites = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavourites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFavourites.fulfilled, (state, action) => {
                state.isLoading = false;
                state.favourites = action.payload;
            })
            .addCase(fetchFavourites.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload || "Failed to load favourites.";
            })
            .addCase(addFavourite.fulfilled, (state, action) => {
                const existing = state.favourites.some(
                    (item) => item.hotel_id === action.payload.hotel_id
                );

                if (!existing) {
                    state.favourites.push(action.payload);
                }
            })
            .addCase(addFavourite.rejected, (state, action) => {
                state.error =
                    action.payload || "Failed to add favourite.";
            })
            .addCase(removeFavourite.fulfilled, (state, action) => {
                state.favourites = state.favourites.filter(
                    (item) => item.hotel_id !== action.payload
                );
            })
            .addCase(removeFavourite.rejected, (state, action) => {
                state.error =
                    action.payload || "Failed to remove favourite.";
            });
    },
});

export const { clearFavourites } = favouriteSlice.actions;
export default favouriteSlice.reducer;
