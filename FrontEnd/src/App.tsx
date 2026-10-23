
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./Pages/SignUp/SignUp";
import Login from "./Pages/Login/Login";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import AddHotel from "./Pages/AddHotel/AddHotel";
import ViewHotels from "./Pages/ViewHotels/ViewHotels";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Home from "./Pages/Home/Home";
import HotelDetails from "./Pages/HotelDetails/HotelDetails";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* Admin-only pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hotels/add" element={<AddHotel />} />
          <Route path="/admin/hotels" element={<ViewHotels />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
