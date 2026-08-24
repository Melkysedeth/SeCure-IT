import { Eye, MapPin, MoreHorizontal, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

type Estado = "en_linea" | "sin_conexion" | "fuera_sede" | "nunca_reportado";

interface Activo {
  codigo: string;
  tipo: string;
  nombre: string;
  usuario_reporta: string;
  usuario: string;
  ubicacion: string;
  estado: Estado;
  bateria: number;
  ultima_conexion: string;
  lat: number | null;
  lng: number | null;
}

const estadoBadge: Record<Estado, { label: string; className: string }> = {
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

function mapActivo(a: any): Activo {
  return {
    codigo: a.codigo,
    tipo: a.tipo ?? "laptop",
    nombre: a.nombre_equipo ?? "Sin nombre",
    usuario_reporta: a.usuario_activo ?? "Sin datos",
    usuario: a.nombre_responsable ?? a.usuario_activo ?? "Sin asignar",
    ubicacion: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    bateria: a.bateria ?? 0,
    ultima_conexion: formatDateTime(a.timestamp_reporte),
    lat: a.latitud ?? null,
    lng: a.longitud ?? null,
  };
}

function BateriaBar({ value }: { value: number }) {
  const color = value > 50 ? "bg-green-500" : value > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-20">
      <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
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
        <Link to="/activos" className="text-xs text-[#519d99] font-medium hover:underline">
          Ver todos los activos →
        </Link>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225 text-sm">
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <TipoBadge tipo={activo.tipo} />
                      <span className="font-mono text-xs text-[#3d3d42] font-medium">{activo.codigo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[#3d3d42] font-medium">{activo.nombre}</p>
                    <p className="text-[11px] text-[#9898a0]">{activo.usuario_reporta}</p>
                  </td>
                  <td className="px-5 py-3 text-[#686971]">{activo.usuario}</td>
                  <td className="px-5 py-3">
                    {activo.ubicacion !== "—" ? (
                      <span className="text-[#686971]">{activo.ubicacion}</span>
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
                      {activo.lat != null && activo.lng != null ? (
                        <Link
                          to={`/mapa?lat=${activo.lat}&lng=${activo.lng}&codigo=${activo.codigo}`}
                          className="hover:text-[#519d99] transition-colors"
                        >
                          <MapPin size={15} />
                        </Link>
                      ) : (
                        <MapPin size={15} className="opacity-30 cursor-not-allowed" />
                      )}
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