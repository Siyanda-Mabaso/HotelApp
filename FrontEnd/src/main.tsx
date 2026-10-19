import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import store from "./Store/store";

createRoot(document.getElementById("root")!).render(
  
    <Provider store={store}>
      <StrictMode>
      <App />
      </StrictMode>
    </Provider>,

);