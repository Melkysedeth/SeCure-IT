import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, MoreHorizontal, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

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
}

const estadoBadge: Record<Estado, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
};

const mockData: Activo[] = [
  {
    codigo: "P155",
    nombre: "HP EliteBook 840",
    usuario: "Juan Pérez",
    cargo: "Desarrollador",
    ubicacion: "Barranquilla",
    sede: "Oficina Principal",
    estado: "en_linea",
    bateria: 82,
    ultima_conexion: "Hace 2 min",
  },
  {
    codigo: "P098",
    nombre: "Lenovo ThinkPad L14",
    usuario: "María Gómez",
    cargo: "Analista",
    ubicacion: "Bogotá",
    sede: "Oficina Norte",
    estado: "en_linea",
    bateria: 65,
    ultima_conexion: "Hace 15 min",
  },
  {
    codigo: "P120",
    nombre: "Dell Latitude 5420",
    usuario: "Andrés Vargas",
    cargo: "Soporte TI",
    ubicacion: "Medellín",
    sede: "Oficina Centro",
    estado: "en_linea",
    bateria: 34,
    ultima_conexion: "Hace 35 min",
  },
  {
    codigo: "P073",
    nombre: "HP ProBook 450 G8",
    usuario: "Laura Martínez",
    cargo: "Contadora",
    ubicacion: "Cali",
    sede: "Oficina Sur",
    estado: "sin_conexion",
    bateria: null,
    ultima_conexion: "Hace 8 horas",
  },
  {
    codigo: "P109",
    nombre: "Lenovo ThinkPad E14",
    usuario: "Carlos Ruiz",
    cargo: "Comercial",
    ubicacion: "Cartagena",
    sede: "Sucursal",
    estado: "sin_conexion",
    bateria: null,
    ultima_conexion: "Hace 1 día",
  },
  {
    codigo: "P067",
    nombre: "Dell Inspiron 15",
    usuario: "Carolina López",
    cargo: "Marketing",
    ubicacion: "Bogotá",
    sede: "Oficina Norte",
    estado: "en_linea",
    bateria: 90,
    ultima_conexion: "Hace 5 min",
  },
  {
    codigo: "P191",
    nombre: "HP EliteBook 830",
    usuario: "Felipe Sánchez",
    cargo: "Desarrollador",
    ubicacion: "Bucaramanga",
    sede: "Sucursal",
    estado: "en_linea",
    bateria: 76,
    ultima_conexion: "Hace 12 min",
  },
  {
    codigo: "P133",
    nombre: "MacBook Air M1",
    usuario: "Natalia Díaz",
    cargo: "Diseñadora",
    ubicacion: "Bogotá",
    sede: "Oficina Norte",
    estado: "sin_conexion",
    bateria: null,
    ultima_conexion: "Hace 7 días",
  },
];

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
const TOTAL_RESULTS = 153;

export default function AssetsFullTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const totalPages = Math.ceil(TOTAL_RESULTS / pageSize);

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
            {mockData.map((activo) => {
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
          Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, TOTAL_RESULTS)} de {TOTAL_RESULTS} resultados
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#686971] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                page === n ? "bg-[#519d99] text-white" : "text-[#686971] hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {n}
            </button>
          ))}

          {totalPages > 3 && <span className="text-[#9898a0] text-xs px-1">...</span>}
          {totalPages > 3 && (
            <button
              onClick={() => setPage(totalPages)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                page === totalPages ? "bg-[#519d99] text-white" : "text-[#686971] hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {totalPages}
            </button>
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
