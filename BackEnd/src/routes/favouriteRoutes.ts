
import { Router } from "express";
import {
    addFavouriteHotel,
    getMyFavourites,
    deleteFavouriteHotel,
} from "../controllers/favouriteControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// All favourite routes require login
router.post("/favourites", protect, addFavouriteHotel);
router.get("/favourites", protect, getMyFavourites);
router.delete(
    "/favourites/:hotelId",
    protect,
    deleteFavouriteHotel
);

export default router;