import mongoose from "mongoose";
import { CURRENCIES, PROMOTION_STATUS } from "../utils/const.js";
import {
  isCommentRequired,
  isEndDateValid,
  isValidAmount,
  userExists,
} from "../utils/promotionValidators.js";

const promotionSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      validate: {
        validator: isValidAmount,
        message:
          "El monto debe ser mayor a 0 y tener como máximo 16 dígitos enteros y 2 decimales",
      },
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: CURRENCIES,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: isEndDateValid,
        message: "La fecha de finalización no puede ser anterior a la fecha de inicio",
      },
    },
    status: {
      type: Number,
      required: true,
      enum: Object.values(PROMOTION_STATUS),
      default: PROMOTION_STATUS.PENDING,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
      required: isCommentRequired,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: userExists,
        message: "El usuario solicitado no existe",
      },
    },
  },
  {
    collection: "promotions",
    versionKey: false,
  }
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;