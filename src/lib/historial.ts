import type { ReporteRaw } from "../hooks/useReportes";

export type EstadoReporte = "en_linea" | "sin_conexion" | "fuera_sede";

export interface ReporteEvento {
  id: string;
  activoId: string;
  codigo: string;
  nombreEquipo: string;
  responsable: string;
  estado: EstadoReporte;
  ciudad: string;
  bateria: number | null;
  ipLocal: string;
  redWifi: string;
  timestamp: string | null;
}

export function mapReporte(raw: ReporteRaw, activosById: Map<string, any>): ReporteEvento {
  const activo = activosById.get(raw.activo_id);
  return {
    id: raw.id,
    activoId: raw.activo_id,
    codigo: activo?.codigo ?? "—",
    nombreEquipo: activo?.nombre_equipo ?? "Activo eliminado",
    responsable: activo?.nombre_responsable ?? raw.usuario_activo ?? "Sin asignar",
    estado: (raw.estado as EstadoReporte) ?? "sin_conexion",
    ciudad: raw.ubicacion_ciudad ?? activo?.ciudad_asignada ?? "—",
    bateria: raw.bateria ?? null,
    ipLocal: raw.ip_local ?? "—",
    redWifi: raw.red_wifi ?? "—",
    timestamp: raw.timestamp_reporte,
  };
}

export const ESTADO_REPORTE_META: Record<EstadoReporte, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
};

export type RangoFecha = "todo" | "hoy" | "7dias" | "30dias";

export function dentroDeRango(iso: string | null, rango: RangoFecha): boolean {
  if (rango === "todo") return true;
  if (!iso) return false;
  const fecha = new Date(iso).getTime();
  const ahora = Date.now();
  const cortes: Record<Exclude<RangoFecha, "todo">, number> = {
    hoy: 24 * 60 * 60 * 1000,
    "7dias": 7 * 24 * 60 * 60 * 1000,
    "30dias": 30 * 24 * 60 * 60 * 1000,
  };
  return ahora - fecha <= cortes[rango as Exclude<RangoFecha, "todo">];
}

export function formatFechaHora(iso: string | null): string {
  if (!iso) return "Sin datos";
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${fecha} ${hora}`;
}
