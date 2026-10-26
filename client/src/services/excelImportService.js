import * as XLSX from "xlsx";
import { createPromotion } from "./promotionService.js";

const REQUIRED_HEADERS = [
  "producto",
  "importe",
  "moneda",
  "fechainicio",
  "fechafin",
];
const AMOUNT_PATTERN = /^\d{1,16}(?:\.\d{1,2})?$/;

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

function getRowError(row, indexes) {
  const getCell = (header) => row[indexes[header]] ?? "";
  const product = String(getCell("producto")).trim();
  const rawAmount = getCell("importe");
  const amount = String(rawAmount).trim();
  const currency = String(getCell("moneda")).trim().toUpperCase();
  const startDate = formatDateCell(getCell("fechainicio"));
  const endDate = formatDateCell(getCell("fechafin"));
  const errors = [];

  if (!product) {
    errors.push("el producto es obligatorio");
  } else if (product.length > 50) {
    errors.push("el producto no puede tener más de 50 caracteres");
  }

  if (!amount) {
    errors.push("el importe es obligatorio");
  } else if (!AMOUNT_PATTERN.test(amount)) {
    errors.push(
      "el importe debe ser mayor a 0 y tener máximo 16 dígitos enteros y 2 decimales"
    );
  } else if (Number(amount) <= 0) {
    errors.push("el importe debe ser mayor a 0");
  }

  if (!["MXN", "USD"].includes(currency)) {
    errors.push("la moneda debe ser MXN o USD");
  }

  if (!startDate) {
    errors.push("la fecha de inicio es obligatoria y debe tener formato YYYY-MM-DD");
  }

  if (!endDate) {
    errors.push("la fecha de fin es obligatoria y debe tener formato YYYY-MM-DD");
  } else if (startDate && endDate < startDate) {
    errors.push("la fecha de fin no puede ser anterior a la fecha de inicio");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    promotion: { product, amount, currency, startDate, endDate },
  };
}

function getApiErrorMessage(requestError) {
  const responseData = requestError.response?.data;
  const details = responseData?.details;

  if (details) {
    return Object.values(details).join(" ");
  }

  return responseData?.error || "No se pudo guardar esta promoción.";
}

export async function importPromotionsFromExcel(file, userId) {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("El archivo no contiene hojas de cálculo.");
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    raw: true,
    blankrows: true,
    defval: "",
  });

  if (rows.length === 0) {
    throw new Error("El archivo está vacío.");
  }

  const headers = rows[0].map((header) =>
    String(header).trim().toLowerCase()
  );
  const indexes = Object.fromEntries(
    REQUIRED_HEADERS.map((header) => [header, headers.indexOf(header)])
  );
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => indexes[header] === -1
  );

  if (missingHeaders.length > 0) {
    throw new Error(
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
    throw new Error("El archivo no contiene filas de promociones.");
  }

  let importedCount = 0;
  const errors = [];

  for (const { row, rowNumber } of dataRows) {
    const { errors: validationErrors, promotion } = getRowError(row, indexes);

    if (validationErrors.length > 0) {
      errors.push(`fila ${rowNumber}: ${validationErrors.join("; ")}.`);
      continue;
    }

    try {
      await createPromotion(userId, promotion);
      importedCount += 1;
    } catch (requestError) {
      errors.push(`fila ${rowNumber}: ${getApiErrorMessage(requestError)}`);
    }
  }

  return { importedCount, errors };
}
