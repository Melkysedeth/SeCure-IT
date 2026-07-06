import * as XLSX from "xlsx";

/**
 * Genera y descarga un archivo .xlsx a partir de un arreglo de objetos planos.
 * Las keys del objeto se usan como encabezados de columna, en el orden en que
 * aparecen — por eso conviene armar el objeto ya con los nombres en español
 * y en el orden que quieres ver en la hoja.
 */
export function exportRowsToExcel(rows: Record<string, string | number>[], filename: string, sheetName = "Datos") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}
