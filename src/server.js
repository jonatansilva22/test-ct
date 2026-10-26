import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || "localhost";

try {
  await connectDB();
  console.log("MongoDB conectado");
} catch (err) {
  console.error("No se pudo conectar a MongoDB:", err.message);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`Servidor en http://${DB_HOST}:${PORT}`);
});

async function shutdown() {
  server.close();
  await disconnectDB();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
