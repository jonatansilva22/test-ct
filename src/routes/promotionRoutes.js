import { Router } from "express";
import {
  changePromotionStatus,
  createPromotion,
  getPromotions,
  importPromotionsFromExcel,
  updatePromotion,
} from "../controllers/promotionController.js";
import { currentUser } from "../middleware/currentUser.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router();

router.get("/", currentUser, getPromotions);
router.post("/import", currentUser, uploadExcel.single("file"), importPromotionsFromExcel);
router.post("/", currentUser, createPromotion);
router.put("/:id", currentUser, updatePromotion);
router.patch("/:id/status", currentUser, changePromotionStatus);

export default router;