import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Describe a room returned by the backend
export interface Room {
  id: number;
  hotel_id: number;
  room_type: string;
  description: string;
  capacity: number;
  price_per_night: number;
  total_rooms: number;
  created_at?: string;
}

// 2. Describe the data needed to create a room
export interface RoomInput {
  hotel_id: number;
  room_type: string;
  description: string;
  capacity: number;
  price_per_night: number;
  total_rooms: number;
}

// 3. Describe the Redux state available to the thunks
interface RoomThunkState {
  login: {
    token: string | null;
  };
}

interface RoomError {
  message: string;
}

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  mutationError: string | null;
  successMessage: string | null;
}

const initialState: RoomState = {
  rooms: [],
  selectedRoom: null,
  isLoading: false,
  isSaving: false,
  error: null,
  mutationError: null,
  successMessage: null,
};

// Helper for displaying backend error messages
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<RoomError>(error)) {
    return (
      error.response?.data?.message || error.message || "Something went wrong."
    );
  }

  return "An unexpected error occurred.";
};

// Helper for admin requests that require authentication
const getAuthHeaders = (token: string | null) => {
  if (!token) {
    throw new Error("Please log in to continue.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 4. Fetch room types belonging to a selected hotel
export const fetchRoomsByHotel = createAsyncThunk<
  Room[],
  number,
  { rejectValue: string; state: RoomThunkState }
>("rooms/fetchRoomsByHotel", async (hotelId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/hotels/${hotelId}/rooms`);

    return response.data.rooms as Room[];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 5. Fetch one room type by its ID
export const fetchRoomById = createAsyncThunk<
  Room,
  number,
  { rejectValue: string }
>("rooms/fetchRoomById", async (roomId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/rooms/${roomId}`);

    return response.data.room as Room;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 6. Create a room type (admin only)
export const createRoom = createAsyncThunk<
  Room,
  RoomInput,
  { rejectValue: string; state: RoomThunkState }
>("rooms/createRoom", async (roomData, { getState, rejectWithValue }) => {
  try {
    const token = getState().login.token;

    const response = await axios.post(
      "/api/rooms",
      roomData,
      getAuthHeaders(token),
    );

    return response.data.room as Room;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 7. Update a room type (admin only)
export const updateRoom = createAsyncThunk<
  Room,
  { id: number; roomData: Omit<RoomInput, "hotel_id"> },
  { rejectValue: string; state: RoomThunkState }
>(
  "rooms/updateRoom",
  async ({ id, roomData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().login.token;

      const response = await axios.put(
        `/api/rooms/${id}`,
        roomData,
        getAuthHeaders(token),
      );

      return response.data.room as Room;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// 8. Delete a room type (admin only)
export const deleteRoom = createAsyncThunk<
  { id: number; hotel_id: number },
  { id: number; hotel_id: number },
  { rejectValue: string; state: RoomThunkState }
>(
  "rooms/deleteRoom",
  async ({ id, hotel_id }, { getState, rejectWithValue }) => {
    try {
      const token = getState().login.token;

      await axios.delete(`/api/rooms/${id}`, getAuthHeaders(token));

      return { id, hotel_id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// 9. Create the Redux slice
const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
      state.mutationError = null;
    },
    clearRoomSuccess: (state) => {
      state.successMessage = null;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    clearSelectedRoom: (state) => {
      state.selectedRoom = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rooms for a hotel
      .addCase(fetchRoomsByHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByHotel.fulfilled, (state, action) => {
        state.isLoading = false;

        // Replace only the rooms for the selected hotel
        const hotelId = action.meta.arg;
        state.rooms = [
          ...state.rooms.filter((room) => room.hotel_id !== hotelId),
          ...action.payload,
        ];
      })
      .addCase(fetchRoomsByHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load rooms.";
      })

      // Fetch one room
      .addCase(fetchRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load the room.";
      })

      // Create room
      .addCase(createRoom.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
        state.successMessage = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isSaving = false;

        const existingIndex = state.rooms.findIndex(
          (room) => room.id === action.payload.id,
        );

        if (existingIndex === -1) {
          state.rooms.push(action.payload);
        }

        state.rooms.sort((a, b) => a.price_per_night - b.price_per_night);

        state.selectedRoom = action.payload;
        state.successMessage = "Room type added successfully.";
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Failed to add the room.";
      })

      // Update room
      .addCase(updateRoom.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
        state.successMessage = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isSaving = false;

        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id,
        );

        if (index !== -1) {
          state.rooms[index] = action.payload;
        }

        state.rooms.sort((a, b) => a.price_per_night - b.price_per_night);

        state.selectedRoom = action.payload;
        state.successMessage = "Room type updated successfully.";
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Failed to update the room.";
      })

      // Delete room
      .addCase(deleteRoom.pending, (state) => {
        state.isSaving = true;
        state.mutationError = null;
        state.successMessage = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isSaving = false;

        state.rooms = state.rooms.filter(
          (room) => room.id !== action.payload.id,
        );

        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = null;
        }

        state.successMessage = "Room type deleted successfully.";
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isSaving = false;
        state.mutationError = action.payload || "Failed to delete the room.";
      });
  },
});

export const {
  clearRoomError,
  clearRoomSuccess,
  setSelectedRoom,
  clearSelectedRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
