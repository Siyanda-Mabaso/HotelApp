
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./Pages/SignUp/SignUp";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;