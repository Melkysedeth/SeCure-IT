import { useState, useMemo, useEffect } from "react";
import { useAssets } from "../../hooks/useAssets";
import { Link } from "react-router-dom";
import { Eye, Pencil, MoreHorizontal, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { AssetsFilters } from "./AssetsFilterBar";

type Estado = "en_linea" | "sin_conexion" | "fuera_sede";

interface Activo {
  codigo: string;
  nombre: string;
  usuario: string;
  cargo: string;
  ubicacion: string;
  sede: string;
  estado: Estado;
  bateria: number | null;
  ultima_conexion: string;
  numero_documento: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Sin datos";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Hace instantes";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} horas`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? "s" : ""}`;
}

function mapActivo(a: any): Activo {
  return {
    codigo: a.codigo,
    nombre: a.nombre_equipo ?? "Sin nombre",
    usuario: a.nombre_responsable ?? a.usuario_activo ?? "Sin asignar",
    cargo: a.departamento ?? "",
    ubicacion: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    sede: a.ciudad_asignada ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    bateria: a.bateria ?? null,
    ultima_conexion: timeAgo(a.timestamp_reporte),
    numero_documento: a.numero_docume ?? "",
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

const estadoBadge: Record<Estado, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
};

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
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0" />
        <span className="text-xs text-[#9898a0]">N/A</span>
      </div>
    );
  }
  const color = value > 50 ? "bg-green-500" : value > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[#686971] whitespace-nowrap">{value}%</span>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [8, 20, 50];

export default function AssetsFullTable({ filters }: { filters: AssetsFilters }) {
  const { data, loading, error } = useAssets();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const mapped = useMemo(() => data.map(mapActivo), [data]);

  const filtered = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    return mapped.filter((a) => {
      if (filters.estado !== "Todos" && a.estado !== filters.estado) return false;
      if (filters.ubicacion !== "Todas" && a.ubicacion !== filters.ubicacion) return false;
      if (filters.usuario !== "Todos" && a.usuario !== filters.usuario) return false;
      if (filters.departamento !== "Todos" && a.cargo !== filters.departamento) return false;
      if (searchLower) {
        const haystack = `${a.codigo} ${a.nombre} ${a.usuario} ${a.numero_documento}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      return true;
    });
  }, [mapped, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-[#9898a0]">Cargando activos...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header de tabla con checkbox seleccionar todo */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-3 text-left w-10">
                <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
              </th>
              <th className="px-2 py-3 text-left">Código</th>
              <th className="px-5 py-3 text-left">Nombre</th>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Ubicación</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Batería</th>
              <th className="px-5 py-3 text-left">Última conexión</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((activo) => {
              const badge = estadoBadge[activo.estado];
              return (
                <tr key={activo.codigo} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <input type="checkbox" className="rounded border-gray-300 accent-[#519d99]" />
                  </td>
                  <td className="px-2 py-3 font-mono text-xs text-[#3d3d42] font-medium">{activo.codigo}</td>
                  <td className="px-5 py-3 text-[#3d3d42] font-medium whitespace-nowrap">{activo.nombre}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(activo.usuario)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {getInitials(activo.usuario)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#3d3d42] font-medium truncate">{activo.usuario}</p>
                        <p className="text-[11px] text-[#9898a0] truncate">{activo.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#9898a0] flex-shrink-0" />
                      <div>
                        <p className="text-[#3d3d42]">{activo.ubicacion}</p>
                        <p className="text-[11px] text-[#9898a0]">{activo.sede}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <BateriaBar value={activo.bateria} />
                  </td>
                  <td className="px-5 py-3 text-[#686971] text-xs whitespace-nowrap">{activo.ultima_conexion}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-[#9898a0]">
                      <Link to={`/activos/${activo.codigo}`} className="hover:text-[#519d99] transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button className="hover:text-[#519d99] transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button className="hover:text-[#519d99] transition-colors">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-wrap gap-3">
        <p className="text-xs text-[#9898a0]">
          Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, totalResults)} de {totalResults} resultados
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
