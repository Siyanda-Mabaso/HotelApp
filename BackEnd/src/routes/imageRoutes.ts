
import { Router } from "express";
import {
  createImage,
  getHotelImages,
  removeImage,
} from "../controllers/imageControllers";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.get("/hotels/:hotelId/images", getHotelImages);

router.post(
  "/hotels/:hotelId/images",
  protect,
  adminOnly,
  createImage
);

router.delete(
  "/images/:imageId",
  protect,
  adminOnly,
  removeImage
);

export default router;
