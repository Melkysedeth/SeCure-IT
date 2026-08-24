import { useState, useMemo, useEffect } from "react";
import { useAssets } from "../../hooks/useAssets";
import { Link } from "react-router-dom";
import {
  Eye, Pencil, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, Trash2,
  Laptop, Monitor, Smartphone, Tablet
} from "lucide-react";
import type { AssetsFilters } from "./AssetsFilterBar";
import { darDeBajaActivo } from "../../lib/assets";
import ConfirmDialog from "../common/ConfirmDialog";
import { useAlerts } from "../../hooks/useAlerts";
import { mapAlerta } from "../../lib/alerts";

export type Estado = "en_linea" | "sin_conexion" | "fuera_sede" | "nunca_reportado";

export interface Activo {
  id: string;
  codigo: string;
  tipo: string;
  nombre: string;
  usuario_reporta: string;
  usuario: string;
  cargo: string;
  ubicacion: string;
  sede: string;
  estado: Estado;
  bateria: number | null;
  ultima_conexion: string;
  numero_documento: string;
  lat: number | null;
  lng: number | null;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "Sin datos";
  const isoConZ = iso.includes("Z") || iso.includes("+") ? iso : iso.replace(" ", "T") + "Z";
  return new Date(isoConZ).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

export function mapActivo(a: any): Activo {
  return {
    id: a.id,
    codigo: a.codigo,
    tipo: a.tipo ?? "laptop",
    nombre: a.nombre_equipo ?? "Sin nombre",
    usuario_reporta: a.usuario_activo ?? "Sin datos",
    usuario: a.nombre_responsable ?? a.usuario_activo ?? "Sin asignar",
    cargo: a.departamento ?? "",
    ubicacion: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    sede: a.ciudad_asignada ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    bateria: a.bateria ?? null,
    ultima_conexion: formatDateTime(a.timestamp_reporte),
    numero_documento: a.numero_docume ?? "",
    lat: a.latitud ?? null,
    lng: a.longitud ?? null,
  };
}

function getPageWindow(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export const estadoBadge: Record<Estado, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
  nunca_reportado: { label: "Nunca reportado", className: "bg-slate-200 text-slate-600" },
};

const tipoConfig: Record<string, { icon: typeof Laptop; label: string; color: string }> = {
  laptop: { icon: Laptop, label: "Laptop", color: "text-blue-500" },
  desktop: { icon: Monitor, label: "Desktop", color: "text-blue-500" },
  celular: { icon: Smartphone, label: "Celular", color: "text-[#519d99]" },
  tablet: { icon: Tablet, label: "Tablet", color: "text-[#519d99]" },
};

function TipoBadge({ tipo }: { tipo: string }) {
  const config = tipoConfig[tipo] ?? tipoConfig.laptop;
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-1.5" title={config.label}>
      <Icon size={14} className={config.color} />
    </div>
  );
}

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarColors = ["bg-[#519d99]", "bg-orange-400", "bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-teal-500"];

function getAvatarColor(nombre: string) {
  const idx = nombre.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

function BateriaBar({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="flex items-center gap-2 min-w-22.5">
        <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0" />
        <span className="text-xs text-[#9898a0]">N/A</span>
      </div>
    );
  }
  const color = value > 50 ? "bg-green-500" : value > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-22.5">
      <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[#686971] whitespace-nowrap">{value}%</span>
    </div>
  );
}

export function applyAssetsFilters(mapped: Activo[], filters: AssetsFilters): Activo[] {
  const searchLower = filters.search.trim().toLowerCase();
  return mapped.filter((a) => {
    if (filters.estado !== "Todos" && a.estado !== filters.estado) return false;
    if (filters.tipo !== "Todos" && a.tipo !== filters.tipo) return false;
    if (filters.ubicacion !== "Todas" && a.ubicacion !== filters.ubicacion) return false;
    if (filters.usuario !== "Todos" && a.usuario !== filters.usuario) return false;
    if (filters.departamento !== "Todos" && a.cargo !== filters.departamento) return false;
    if (searchLower) {
      const haystack = `${a.codigo} ${a.nombre} ${a.usuario} ${a.numero_documento}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }
    return true;
  });
}

const PAGE_SIZE_OPTIONS = [50, 100, 150];

export default function AssetsFullTable({ filters, onEdit }: { filters: AssetsFilters; onEdit: (id: string) => void }) {
  const { data, loading, error, refetch } = useAssets();

  const { data: alertasRaw } = useAlerts();

  const pendientesPorActivo = useMemo(() => {
    const set = new Set<string>();
    alertasRaw.forEach((raw) => {
      const a = mapAlerta(raw);
      if (a.estado === "PendienteConfirmacion" && a.activoId) set.add(a.activoId);
    });
    return set;
  }, [alertasRaw]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Activo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const mapped = useMemo(() => data.map(mapActivo), [data]);

  const filtered = useMemo(() => applyAssetsFilters(mapped, filters), [mapped, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await darDeBajaActivo(confirmTarget.id);
      refetch();
      setConfirmTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo dar de baja el activo.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-[#9898a0]">Cargando activos...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-250 text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="px-4 py-2.5 text-left w-10 border-r border-slate-200">
                <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Código</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Nombre</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Usuario</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Ubicación</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Estado</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Batería</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide border-r border-slate-200">Última conexión</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((activo, idx) => {
              const badge = estadoBadge[activo.estado];
              return (
                <tr
                  key={activo.codigo}
                  className={`border-b border-slate-100 hover:bg-[#519d99]/5 transition-colors ${idx % 2 === 1 ? "bg-slate-100/70" : "bg-white"}`}
                >
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[#3d3d42] font-medium border-r border-slate-100">{activo.codigo}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <TipoBadge tipo={activo.tipo} />
                      <div>
                        <p className="text-[#3d3d42] font-medium">{activo.nombre}</p>
                        <p className="text-[11px] text-[#9898a0]">{activo.usuario_reporta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(activo.usuario)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                        {getInitials(activo.usuario)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#3d3d42] font-medium truncate">{activo.usuario}</p>
                        <p className="text-[11px] text-[#9898a0] truncate">{activo.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    {activo.ubicacion !== "—" ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#9898a0] shrink-0" />
                        <div>
                          <p className="text-[#3d3d42]">{activo.ubicacion}</p>
                          <p className="text-[11px] text-[#9898a0]">{activo.sede}</p>
                        </div>
                      </div>
                    ) : activo.lat != null && activo.lng != null ? (
                      <Link
                        to={`/mapa?lat=${activo.lat}&lng=${activo.lng}&codigo=${activo.codigo}`}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-[#519d99]/10 text-[#519d99] hover:bg-[#519d99]/20 transition-colors"
                      >
                        <MapPin size={12} />
                        Ver en mapa
                      </Link>
                    ) : (
                      <span className="text-[#9898a0] text-xs">Sin ubicación</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${badge.className}`}>{badge.label}</span>
                      {pendientesPorActivo.has(activo.id) && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-amber-100 text-amber-700">Pendiente por confirmar</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <BateriaBar value={activo.bateria} />
                  </td>
                  <td className="px-4 py-2.5 text-[#686971] text-xs whitespace-nowrap border-r border-slate-100">{activo.ultima_conexion}</td>
                  <td className="px-4 py-2.5">
                    <div className="relative flex items-center gap-2 text-[#9898a0]">
                      <Link to={`/activos/${activo.codigo}`} className="hover:text-[#519d99] transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => onEdit(activo.id)} className="hover:text-[#519d99] transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setMenuOpenId(menuOpenId === activo.id ? null : activo.id)} className="hover:text-[#519d99] transition-colors">
                        <MoreHorizontal size={15} />
                      </button>

                      {menuOpenId === activo.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-0 top-6 z-20 w-40 bg-white border border-gray-100 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setConfirmTarget(activo);
                                setDeleteError(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Dar de baja
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Dar de baja activo"
        message={
          confirmTarget ? `Esta acción eliminará permanentemente "${confirmTarget.nombre}" (${confirmTarget.codigo}), junto con todos sus reportes y alertas asociadas. No se puede deshacer.` : ""
        }
        confirmLabel="Dar de baja"
        loading={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
