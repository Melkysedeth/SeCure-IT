import { useEffect, useMemo, useState } from "react";
import { Eye, MoreHorizontal, Laptop, Smartphone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAllAlerts } from "../../hooks/useAllAlerts";
import { SEVERITY_META, ESTADO_META, timeAgo, formatFecha, getInitials, getAvatarColor, getPageWindow, type Alerta, type EstadoAlerta } from "../../lib/alerts";
import type { AlertsFilters } from "./AlertsFilterBar";
import AlertDetailPanel from "./AlertDetailPanel";

const PAGE_SIZE_OPTIONS = [50, 100, 150];

export default function AlertsFullTable({ filters }: { filters: AlertsFilters }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const { data, total, loading, error } = useAllAlerts({ page, pageSize, filters });
  const [overrides, setOverrides] = useState<Record<string, EstadoAlerta>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const mapped = useMemo(() => {
    return data.map((a) => (overrides[a.id] ? { ...a, estado: overrides[a.id] } : a));
  }, [data, overrides]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const activeAlert = activeId ? (mapped.find((a) => a.id === activeId) ?? null) : null;

  const totalResults = total;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const pageData = mapped;

  function handleUpdated(id: string, estado: EstadoAlerta) {
    setOverrides((prev) => ({ ...prev, [id]: estado }));
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-[#9898a0]">Cargando alertas...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex gap-6 min-h-0">
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="px-4 py-2.5 text-left w-10 border-r border-slate-200">
                  <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
                </th>
                <th className="px-2 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Severidad</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Alerta</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Activo</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Responsable</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Ubicación</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Fecha/Hora</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Estado</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((a: Alerta, idx) => {
                const meta = SEVERITY_META[a.severidad];
                const estadoMeta = ESTADO_META[a.estado];
                const isActiveRow = a.id === activeId;
                return (
                  <tr
                    key={a.id}
                    onClick={() => setActiveId(a.id)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${isActiveRow ? "bg-teal-50/40" : idx % 2 === 1 ? "bg-slate-100/70 hover:bg-[#519d99]/5" : "bg-white hover:bg-[#519d99]/5"
                      }`}
                  >
                    <td className="px-4 py-2.5 border-r border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
                    </td>
                    <td className="px-2 py-2.5 border-r border-slate-100">
                      <meta.Icon size={18} style={{ color: meta.dot }} />
                    </td>
                    <td className="px-4 py-2.5 max-w-50 border-r border-slate-100">
                      <p className="text-[#3d3d42] font-medium truncate">{a.tipo}</p>
                      <p className="text-[11px] text-[#9898a0] truncate">{a.descripcion}</p>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        {a.origen === "movil" ? (
                          <Smartphone size={14} className="text-[#9898a0] shrink-0" />
                        ) : (
                          <Laptop size={14} className="text-[#9898a0] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[#3d3d42] font-medium truncate">{a.nombreEquipo}</p>
                          <p className="text-[11px] text-[#9898a0] font-mono truncate">{a.codigo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${getAvatarColor(a.responsable)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                          {getInitials(a.responsable)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#3d3d42] font-medium truncate">{a.responsable}</p>
                          <p className="text-[11px] text-[#9898a0] truncate">{a.departamento}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100" onClick={(e) => e.stopPropagation()}>
                      {a.origen === "movil" ? (
                        a.lat !== null && a.lng !== null ? (
                          <Link
                            to={`/mapa?lat=${a.lat}&lng=${a.lng}&codigo=${a.codigo}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-[#519d99]/10 text-[#519d99] hover:bg-[#519d99]/20 transition-colors"
                          >
                            <MapPin size={12} />
                            Ver en mapa
                          </Link>
                        ) : (
                          <span className="text-[#9898a0] text-xs">Sin ubicación</span>
                        )
                      ) : (
                        <span className="text-[#686971]">{a.ciudad}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <p className="text-[#3d3d42] text-xs">{timeAgo(a.createdAt)}</p>
                      <p className="text-[11px] text-[#9898a0]">{formatFecha(a.createdAt)}</p>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${estadoMeta.badgeClass}`}>{estadoMeta.label}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-[#9898a0]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setActiveId(a.id)} className="hover:text-[#519d99] transition-colors">
                          <Eye size={15} />
                        </button>
                        <button className="hover:text-[#519d99] transition-colors">
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-sm text-[#9898a0]">
                    No se encontraron alertas con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-3">
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
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === n ? "bg-[#519d99] text-white" : "text-[#686971] hover:bg-gray-50 border border-gray-200"
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

      {activeAlert && <AlertDetailPanel alerta={activeAlert} onClose={() => setActiveId(null)} onUpdated={handleUpdated} />}
    </div>
  );
}