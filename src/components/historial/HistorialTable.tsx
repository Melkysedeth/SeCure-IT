import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Laptop } from "lucide-react";
import { useReportes } from "../../hooks/useReportes";
import { useAssets } from "../../hooks/useAssets";
import { mapReporte, ESTADO_REPORTE_META, dentroDeRango, formatFechaHora, type ReporteEvento } from "../../lib/historial";
import { getInitials, getAvatarColor, getPageWindow } from "../../lib/alerts";
import type { HistorialFilters } from "./HistorialFilterBar";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function useHistorialData(filters: HistorialFilters) {
  const { data: reportesRaw, loading: loadingReportes, error: errorReportes, refetch } = useReportes();
  const { data: activos, loading: loadingActivos } = useAssets();

  const activosById = useMemo(() => new Map(activos.map((a: any) => [a.id, a])), [activos]);

  const eventos = useMemo(() => reportesRaw.map((r) => mapReporte(r, activosById)), [reportesRaw, activosById]);

  const ciudades = useMemo(() => {
    const set = new Set(eventos.map((e) => e.ciudad).filter((c) => c && c !== "—"));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [eventos]);

  const filtered = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    return eventos.filter((e) => {
      if (!dentroDeRango(e.timestamp, filters.rango)) return false;
      if (filters.estado !== "Todos" && e.estado !== filters.estado) return false;
      if (filters.ciudad !== "Todas" && e.ciudad !== filters.ciudad) return false;
      if (searchLower) {
        const haystack = `${e.codigo} ${e.nombreEquipo} ${e.responsable}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      return true;
    });
  }, [eventos, filters]);

  return {
    filtered,
    ciudades,
    loading: loadingReportes || loadingActivos,
    error: errorReportes,
    refetch,
  };
}

export default function HistorialTable({ filters }: { filters: HistorialFilters }) {
  const { filtered, loading, error } = useHistorialData(filters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-[#9898a0]">Cargando historial...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-3 text-left">Fecha/Hora</th>
              <th className="px-5 py-3 text-left">Activo</th>
              <th className="px-5 py-3 text-left">Responsable</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Ciudad</th>
              <th className="px-5 py-3 text-left">Batería</th>
              <th className="px-5 py-3 text-left">IP local</th>
              <th className="px-5 py-3 text-left">Red WiFi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((e: ReporteEvento) => {
              const meta = ESTADO_REPORTE_META[e.estado];
              return (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-[#3d3d42] text-xs whitespace-nowrap">{formatFechaHora(e.timestamp)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Laptop size={14} className="text-[#9898a0] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[#3d3d42] font-medium truncate">{e.nombreEquipo}</p>
                        <p className="text-[11px] text-[#9898a0] font-mono truncate">{e.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(e.responsable)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {getInitials(e.responsable)}
                      </div>
                      <p className="text-[#3d3d42] truncate">{e.responsable}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${meta.className}`}>{meta.label}</span>
                  </td>
                  <td className="px-5 py-3 text-[#686971]">{e.ciudad}</td>
                  <td className="px-5 py-3 text-[#686971] text-xs">{e.bateria !== null ? `${e.bateria}%` : "N/A"}</td>
                  <td className="px-5 py-3 text-[#686971] text-xs font-mono">{e.ipLocal}</td>
                  <td className="px-5 py-3 text-[#686971] text-xs">{e.redWifi}</td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-sm text-[#9898a0]">
                  No hay reportes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-wrap gap-3">
        <p className="text-xs text-[#9898a0]">
          Mostrando {totalResults === 0 ? 0 : (page - 1) * pageSize + 1} a {Math.min(page * pageSize, totalResults)} de {totalResults} resultados
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#686971] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          {getPageWindow(page, totalPages).map((n, i) =>
            n === "..." ? (
              <span key={`ellipsis-${i}`} className="text-[#9898a0] text-xs px-1">
                ...
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  page === n ? "bg-[#519d99] text-white" : "text-[#686971] hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {n}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#686971] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
