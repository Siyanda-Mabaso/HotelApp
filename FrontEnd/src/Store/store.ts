
import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import signUpReducer from "../ReduxSlice/SignUpSlice";
import loginReducer, { logout } from "../ReduxSlice/LoginSlice";
import favouriteReducer from "../ReduxSlice/favouriteSlice";
import hotelReducer from "../ReduxSlice/hotelSlice";

const authListener = createListenerMiddleware();

authListener.startListening({
  actionCreator: logout,
  effect: () => {
    localStorage.removeItem("paradiseAuth");
  },
});

const store = configureStore({
  reducer: {
    signUp: signUpReducer,
    login: loginReducer,
    favourites: favouriteReducer,
    hotels: hotelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authListener.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
