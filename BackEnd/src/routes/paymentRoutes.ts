
import { Router } from "express";

import {
  initializeBookingPayment,
  verifyBookingPayment
} from "../controllers/paymentController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/initialize", protect, initializeBookingPayment);

router.post("/verify", protect, verifyBookingPayment);

export default router;
