import { Eye, MapPin, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

type Estado = "en_linea" | "sin_conexion" | "fuera_sede";

interface Activo {
  codigo: string;
  nombre: string;
  usuario: string;
  ubicacion: string;
  estado: Estado;
  bateria: number;
  ultima_conexion: string;
}

const estadoBadge: Record<Estado, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
};

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
    ubicacion: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    bateria: a.bateria ?? 0,
    ultima_conexion: timeAgo(a.timestamp_reporte),
  };
}

function BateriaBar({ value }: { value: number }) {
  const color = value > 50 ? "bg-green-500" : value > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[#686971] whitespace-nowrap">{value}%</span>
    </div>
  );
}

export default function AssetsTable() {
  const { data, loading } = useAssets();

  const recientes = useMemo(() => {
    return [...data]
      .sort((a: any, b: any) => new Date(b.timestamp_reporte ?? 0).getTime() - new Date(a.timestamp_reporte ?? 0).getTime())
      .slice(0, 10)
      .map(mapActivo);
  }, [data]);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-sm text-[#9898a0]">Cargando activos...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Activos recientes</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todos los activos →</button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-3 text-left">Código</th>
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
            {recientes.map((activo) => {
              const badge = estadoBadge[activo.estado];
              return (
                <tr key={activo.codigo} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#3d3d42] font-medium">{activo.codigo}</td>
                  <td className="px-5 py-3 text-[#3d3d42] font-medium">{activo.nombre}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.usuario}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.ubicacion}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-5 py-3">{activo.bateria > 0 ? <BateriaBar value={activo.bateria} /> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-5 py-3 text-[#686971] text-xs">{activo.ultima_conexion}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-[#9898a0]">
                      <Link to={`/activos/${activo.codigo}`} className="hover:text-[#519d99] transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button className="hover:text-[#519d99] transition-colors">
                        <MapPin size={15} />
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
    </div>
  );
}
