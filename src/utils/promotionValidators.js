import User from "../models/User.js";
import { PROMOTION_STATUS } from "./const.js";

// Valida el rango permitido para un importe decimal(18,2).
export function isValidAmount(value) {
  if (value == null) {
    return true;
  }

  const amount = value.toString();
  return /^\d{1,16}(?:\.\d{1,2})?$/.test(amount) && Number(amount) > 0;
}

// Compara ambas fechas del documento actual.
export function isEndDateValid(value) {
  return !this.startDate || value >= this.startDate;
}

export function isCommentRequired() {
  return this.status === PROMOTION_STATUS.REJECTED;
}

export async function userExists(value) {
  if (value == null) {
    return true;
  }

  return Boolean(await User.exists({ _id: value }));
}
