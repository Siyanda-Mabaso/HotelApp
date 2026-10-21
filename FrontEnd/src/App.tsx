
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./Pages/SignUp/SignUp";
import Login from "./Pages/Login/Login";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
         <Route path="/login" element={<Login />} />
         <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;