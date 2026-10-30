
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../Store/store";

interface Profile {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface ProfileState {
    profile: Profile | null;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    success: string | null;
}

const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    success: null,
};

// Get the logged-in user's profile
export const fetchMyProfile = createAsyncThunk<
    Profile,
    void,
    { state: RootState; rejectValue: string }
>(
    "profile/fetchMyProfile",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().login.token;

            const response = await axios.get("/api/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.user as Profile;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );
            }

            return rejectWithValue("Failed to load profile");
        }
    }
);

// Update the logged-in user's profile
export const updateMyProfile = createAsyncThunk<
    Profile,
    { name: string; email: string },
    { state: RootState; rejectValue: string }
>(
    "profile/updateMyProfile",
    async (profileData, { getState, rejectWithValue }) => {
        try {
            const token = getState().login.token;

            const response = await axios.put(
                "/api/users/me",
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.user as Profile;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to update profile"
                );
            }

            return rejectWithValue("Failed to update profile");
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfileMessages: (state) => {
            state.error = null;
            state.success = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch profile
            .addCase(fetchMyProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload || "Failed to load profile";
            })

            // Update profile
            .addCase(updateMyProfile.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateMyProfile.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.profile = action.payload;
                state.success = "Profile updated successfully";
            })
            .addCase(updateMyProfile.rejected, (state, action) => {
                state.isUpdating = false;
                state.error =
                    action.payload || "Failed to update profile";
            });
    },
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;
