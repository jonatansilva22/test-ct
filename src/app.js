import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";


const app = express();

app.use(express.json());

app.get("/api/test", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/users", userRoutes);
app.use("/api/users/:id", userRoutes);
app.use("/api/promotions", promotionRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
