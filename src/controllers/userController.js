import User from "../models/User.js";

export async function getUsers(_req, res) {
  const users = await User.find()
    .select("name role")
    .sort({ name: 1 });

  res.json(users);
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select("name role");

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.json(user);
}
