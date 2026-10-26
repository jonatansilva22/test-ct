import mongoose from "mongoose";
import User from "../models/User.js";

// Busca el usuario elegido para que las rutas puedan consultar su rol e id.
export async function currentUser(req, res, next) {
  const { userId } = req.query;

  if (
    typeof userId !== "string" ||
    !mongoose.isObjectIdOrHexString(userId)
  ) {
    return res.status(400).json({
      error: "El parámetro userId debe ser un ObjectId válido",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  req.user = user;
  next();
}
