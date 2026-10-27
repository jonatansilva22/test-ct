import * as XLSX from "xlsx";
import Promotion from "../models/Promotion.js";
import { PROMOTION_STATUS } from "../utils/const.js";

const REQUIRED_HEADERS = [
  "producto",
  "importe",
  "moneda",
  "fechainicio",
  "fechafin",
];

function createImportError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function formatDateCell(value) {
  let year;
  let month;
  let day;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    year = value.getUTCFullYear();
    month = value.getUTCMonth() + 1;
    day = value.getUTCDate();
  } else if (typeof value === "number") {
    const parsedDate = XLSX.SSF.parse_date_code(value);
    if (!parsedDate) return "";
    ({ y: year, m: month, d: day } = parsedDate);
  } else if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return "";
    [, year, month, day] = match.map(Number);
  } else {
    return "";
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getCell(row, indexes, header) {
  return row[indexes[header]] ?? "";
}

function getValidationMessages(error) {
  return Object.values(error.errors).map(
    (validationError) => validationError.message
  );
}

export async function importPromotionsFromExcel(fileBuffer, userId) {
  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  } catch {
    throw createImportError("No se pudo leer el archivo Excel. Verifica que sea válido.");
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw createImportError("El archivo no contiene hojas de cálculo.");
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    raw: true,
    blankrows: true,
    defval: "",
  });

  if (rows.length === 0) {
    throw createImportError("El archivo está vacío.");
  }

  const headers = rows[0].map((header) => String(header).trim().toLowerCase());
  const indexes = Object.fromEntries(
    REQUIRED_HEADERS.map((header) => [header, headers.indexOf(header)])
  );
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => indexes[header] === -1
  );

  if (missingHeaders.length > 0) {
    throw createImportError(
      `Faltan columnas requeridas en la plantilla: ${missingHeaders.join(", ")}.`
    );
  }

  const dataRows = rows
    .map((row, index) => ({ row, rowNumber: index + 1 }))
    .slice(1)
    .filter(({ row }) =>
      row.some((cell) => String(cell ?? "").trim() !== "")
    );

  if (dataRows.length === 0) {
    throw createImportError("El archivo no contiene filas de promociones.");
  }

  const validPromotions = [];
  const errors = [];

  for (const { row, rowNumber } of dataRows) {
    const rawAmount = getCell(row, indexes, "importe");
    const promotion = new Promotion({
      product: String(getCell(row, indexes, "producto")).trim(),
      amount:
        rawAmount === "" || rawAmount == null
          ? rawAmount
          : String(rawAmount).trim(),
      currency: String(getCell(row, indexes, "moneda")).trim(),
      startDate: formatDateCell(getCell(row, indexes, "fechainicio")),
      endDate: formatDateCell(getCell(row, indexes, "fechafin")),
      status: PROMOTION_STATUS.PENDING,
      userId,
    });

    try {
      await promotion.validate();
      validPromotions.push(promotion);
    } catch (validationError) {
      if (validationError.name !== "ValidationError") {
        throw validationError;
      }

      errors.push(
        `fila ${rowNumber}: ${getValidationMessages(validationError).join("; ")}.`
      );
    }
  }

  if (validPromotions.length > 0) {
    await Promotion.insertMany(validPromotions);
  }

  return {
    importedCount: validPromotions.length,
    errors,
  };
}
