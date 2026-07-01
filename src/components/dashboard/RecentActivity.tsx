import { Wifi, MapPin, WifiOff } from "lucide-react";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useAlerts } from "../../hooks/useAlerts";

const iconMap = {
  en_linea: { icon: Wifi, className: "bg-green-100 text-green-600" },
  fuera_sede: { icon: MapPin, className: "bg-orange-100 text-orange-600" },
  sin_conexion: { icon: WifiOff, className: "bg-red-100 text-red-600" },
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

export function ActividadReciente() {
  const { data, loading } = useAssets();

  const recientes = useMemo(() => {
    return [...data].sort((a: any, b: any) => new Date(b.timestamp_reporte ?? 0).getTime() - new Date(a.timestamp_reporte ?? 0).getTime()).slice(0, 4);
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Últimos reportes</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todas</button>
      </div>
      <div className="flex flex-col">
        {loading && <p className="px-5 py-4 text-xs text-[#9898a0]">Cargando...</p>}
        {!loading && recientes.length === 0 && <p className="px-5 py-4 text-xs text-[#9898a0]">Sin reportes registrados aún.</p>}
        {recientes.map((a: any) => {
          const meta = iconMap[a.estado as keyof typeof iconMap] ?? iconMap.sin_conexion;
          const Icon = meta.icon;
          return (
            <div key={a.id} className="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className={`${meta.className} p-2 rounded-lg h-fit`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#3d3d42] truncate">
                  {a.codigo} - {a.nombre_equipo}
                </p>
                <p className="text-[11px] text-[#9898a0]">Reportó desde {a.ubicacion_ciudad ?? "ubicación desconocida"}</p>
                <p className="text-[10px] text-[#9898a0] mt-0.5">{timeAgo(a.timestamp_reporte)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AlertasRecientes() {
  const { data, loading } = useAlerts({ limit: 4 });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Alertas recientes</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todas</button>
      </div>
      <div className="flex flex-col">
        {loading && <p className="px-5 py-4 text-xs text-[#9898a0]">Cargando...</p>}
        {!loading && data.length === 0 && <p className="px-5 py-4 text-xs text-[#9898a0]">Sin alertas registradas.</p>}
        {data.map((al: any) => (
          <div key={al.id} className="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
            <div className={`p-2 rounded-lg h-fit ${al.severidad === "critica" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
              {al.tipo === "sin_conexion" ? <WifiOff size={14} /> : <MapPin size={14} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#3d3d42] truncate">
                {al.codigo} - {al.nombre_equipo}
              </p>
              <p className="text-[11px] text-[#9898a0]">{al.descripcion}</p>
              <p className="text-[10px] text-[#9898a0] mt-0.5">{timeAgo(al.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
