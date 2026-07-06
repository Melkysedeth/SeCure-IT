import { useState } from "react";
import { History, Download } from "lucide-react";
import HistorialFilterBar, { DEFAULT_HISTORIAL_FILTERS, type HistorialFilters } from "../components/historial/HistorialFilterBar";
import HistorialTable, { useHistorialData } from "../components/historial/HistorialTable";
import { ESTADO_REPORTE_META, formatFechaHora } from "../lib/historial";
import { exportRowsToExcel } from "../lib/exportExcel";

export default function Historial() {
  const [filters, setFilters] = useState<HistorialFilters>(DEFAULT_HISTORIAL_FILTERS);
  const { filtered, ciudades } = useHistorialData(filters);

  function handleExport() {
    const rows = filtered.map((e) => ({
      "Fecha/Hora": formatFechaHora(e.timestamp),
      Código: e.codigo,
      Equipo: e.nombreEquipo,
      Responsable: e.responsable,
      Estado: ESTADO_REPORTE_META[e.estado].label,
      Ciudad: e.ciudad,
      "Batería (%)": e.bateria ?? "N/A",
      "IP local": e.ipLocal,
      "Red WiFi": e.redWifi,
    }));

    const fecha = new Date().toISOString().slice(0, 10);
    exportRowsToExcel(rows, `historial_${fecha}.xlsx`, "Historial");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#519d99]/10 p-2 rounded-lg">
            <History className="text-[#519d99]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3d3d42]">Historial</h1>
            <p className="text-sm text-[#9898a0]">Bitácora de reportes de todos los equipos, ordenada por fecha.</p>
          </div>
        </div>
        <button onClick={handleExport} className="border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download size={16} />
          Exportar
        </button>
      </div>

      <HistorialFilterBar filters={filters} ciudades={ciudades} onChange={setFilters} />
      <HistorialTable filters={filters} />
    </div>
  );
}
