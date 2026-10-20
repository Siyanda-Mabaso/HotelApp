
import { configureStore } from "@reduxjs/toolkit";
import signUpReducer from "../ReduxSlice/SignUpSlice";

const store = configureStore({
  reducer: {
    signUp: signUpReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;