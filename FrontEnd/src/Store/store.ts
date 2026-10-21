import { configureStore } from "@reduxjs/toolkit";
import signUpReducer from "../ReduxSlice/SignUpSlice";
import loginReducer from "../ReduxSlice/LoginSlice";

const store = configureStore({
  reducer: {
    signUp: signUpReducer,
    login: loginReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;