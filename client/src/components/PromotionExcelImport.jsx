import { useState } from "react";
import * as XLSX from "xlsx";
import Message from "./Message.jsx";
import { importPromotionsFromExcel } from "../services/excelImportService.js";

const TEMPLATE_HEADERS = [
  "producto",
  "importe",
  "moneda",
  "fechaInicio",
  "fechaFin",
];

function downloadTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 16 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Promociones");
  XLSX.writeFile(workbook, "Plantilla_carga_promociones.xlsx");
}

function PromotionExcelImport({ userId, onImportComplete }) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleFileChange(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Selecciona un archivo con formato .xlsx.");
      input.value = "";
      return;
    }

    setIsImporting(true);

    try {
      const importResult = await importPromotionsFromExcel(file, userId);
      setResult(importResult);
      if (importResult.importedCount > 0) {
        onImportComplete();
      }
    } catch (importError) {
      setError(
        importError.response?.data?.error ||
          importError.message ||
          "No se pudo procesar el archivo."
      );
    } finally {
      setIsImporting(false);
      input.value = "";
    }
  }

  return (
    <section className="excel-import">
      <div className="excel-import__header">
        <div>
          <h2>Carga desde Excel</h2>
          <p className="field-hint">
            Descarga la plantilla y sube un archivo .xlsx. El servidor valida y
            guarda las filas válidas.
          </p>
        </div>
        <div className="excel-import__actions">
          <button
            className="button button--secondary"
            onClick={downloadTemplate}
            type="button"
          >
            Plantilla
          </button>
          <label className="button button--secondary excel-import__file" htmlFor="promotion-excel">
            Subir Excel
            <input
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="visually-hidden"
              disabled={isImporting}
              id="promotion-excel"
              onChange={handleFileChange}
              type="file"
            />
          </label>
        </div>
      </div>

      {isImporting && <Message>El servidor está validando e importando filas...</Message>}
      {error && <Message type="error">{error}</Message>}

      {result && (
        <>
          <Message type={result.errors.length > 0 ? "info" : "success"}>
            {result.importedCount > 0
              ? `Se guardaron ${result.importedCount} promociones.`
              : "No se guardaron promociones."}
            {result.errors.length > 0 &&
              ` ${result.errors.length} filas tienen errores.`}
          </Message>
          {result.errors.length > 0 && (
            <ul className="excel-import__errors">
              {result.errors.map((rowError) => (
                <li key={rowError}>{rowError}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default PromotionExcelImport;
