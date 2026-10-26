import mongoose from "mongoose";

export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGODB_URI no está definida. Revisa tu archivo .env");
  }
  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

