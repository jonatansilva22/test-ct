// Convierte los errores conocidos en respuestas claras para el cliente.
export function errorHandler(err, _req, res, _next) {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "El archivo no puede superar los 5 MB",
      });
    }

    return res.status(400).json({ error: "No se pudo recibir el archivo" });
  }

  if (err.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, validationError]) => [
        field,
        validationError.message,
      ])
    );

    return res.status(400).json({ error: "Datos inválidos", details });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "El formato de un dato no es válido" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Ya existe un registro con esos datos" });
  }

  const statusCode = err.statusCode || err.status;
  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({ error: err.message });
  }

  console.error("Error interno del servidor:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
