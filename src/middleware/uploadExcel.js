import multer from "multer";

export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    if (!file.originalname.toLowerCase().endsWith(".xlsx")) {
      const error = new Error("Selecciona un archivo con formato .xlsx");
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});
