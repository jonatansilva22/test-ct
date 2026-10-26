import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";

const initialUsers = [
  { name: "Ana", role: "solicitante" },
  { name: "Luis", role: "solicitante" },
  { name: "Marta", role: "administrador" },
];

// Permite ejecutar el seed varias veces sin duplicar usuarios.
async function seedUsers() {
  await connectDB();

  try {
    for (const user of initialUsers) {
      await User.updateOne({ name: user.name }, { $set: user }, { upsert: true });
    }

    console.log("Usuarios iniciales cargados");
  } finally {
    await disconnectDB();
  }
}

seedUsers().catch((error) => {
  console.error("Error al cargar usuarios:", error);
  process.exitCode = 1;
});
