import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./Pages/SignUp/SignUp";
import Login from "./Pages/Login/Login";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import AddHotel from "./Pages/AddHotel/AddHotel";
import ViewHotels from "./Pages/ViewHotels/ViewHotels";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import CustomerProtectedRoute from "./Components/ProtectedRoute/CustomerProtectedRoute";

import Home from "./Pages/Home/Home";
import HotelDetails from "./Pages/HotelDetails/HotelDetails";
import Booking from "./Pages/Booking/Booking";
import MyBookings from "./Pages/MyBookings/MyBookings";
import Profile from "./Pages/Profile/Profile";
import ManageRooms from "./Pages/ManageRooms/ManageRooms";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: no login required */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* Customer-only pages */}
        <Route element={<CustomerProtectedRoute />}>
          <Route path="/hotels/:id/book" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin-only pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hotels/add" element={<AddHotel />} />
          <Route path="/admin/hotels" element={<ViewHotels />} />
          <Route
            path="/admin/hotels/:hotelId/rooms"
            element={<ManageRooms />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
