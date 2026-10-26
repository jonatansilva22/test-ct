import { Router } from "express";
import {
  changePromotionStatus,
  createPromotion,
  getPromotions,
  updatePromotion,
} from "../controllers/promotionController.js";
import { currentUser } from "../middleware/currentUser.js";

const router = Router();

router.get("/", currentUser, getPromotions);
router.post("/", currentUser, createPromotion);
router.put("/:id", currentUser, updatePromotion);
router.patch("/:id/status", currentUser, changePromotionStatus);

export default router;