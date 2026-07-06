import { AlertTriangle, AlertCircle, Bell, CheckCircle2 } from "lucide-react";

// ---------- Tipos ----------
export type Severidad = "critica" | "alta" | "media" | "baja";
export type EstadoAlerta = "Activa" | "PendienteConfirmacion" | "Resuelta";

// Forma cruda que devuelve la vista `alertas_con_activo`
export interface AlertaRaw {
  id: string;
  activo_id: string | null;
  tipo: string | null;
  severidad: string | null;
  descripcion: string | null;
  estado: string | null;
  ubicacion_ciudad: string | null;
  created_at: string | null;
  codigo: string | null;
  nombre_equipo: string | null;
  nombre_responsable: string | null;
  departamento: string | null;
}

// Forma normalizada que usa la UI
export interface Alerta {
  id: string;
  activoId: string | null;
  tipo: string;
  descripcion: string;
  severidad: Severidad;
  estado: EstadoAlerta;
  ciudad: string;
  createdAt: string | null;
  codigo: string;
  nombreEquipo: string;
  responsable: string;
  departamento: string;
}

const SEVERIDADES_VALIDAS: Severidad[] = ["critica", "alta", "media", "baja"];

export function mapAlerta(raw: AlertaRaw): Alerta {
  const severidadNormalizada = (raw.severidad ?? "").toLowerCase().trim();
  const severidad: Severidad = (SEVERIDADES_VALIDAS as string[]).includes(severidadNormalizada) ? (severidadNormalizada as Severidad) : "media";

  const estadoNormalizado = (raw.estado ?? "").toLowerCase().trim();
  const estado: EstadoAlerta = estadoNormalizado.startsWith("pendiente") ? "PendienteConfirmacion" : estadoNormalizado.startsWith("resuel") ? "Resuelta" : "Activa";

  return {
    id: raw.id,
    activoId: raw.activo_id,
    tipo: raw.tipo ?? "Alerta",
    descripcion: raw.descripcion ?? "",
    severidad,
    estado,
    ciudad: raw.ubicacion_ciudad ?? "—",
    createdAt: raw.created_at,
    codigo: raw.codigo ?? "—",
    nombreEquipo: raw.nombre_equipo ?? "Sin nombre",
    responsable: raw.nombre_responsable ?? "Sin asignar",
    departamento: raw.departamento ?? "",
  };
}

// ---------- Formateo de fecha ----------
export function timeAgo(iso: string | null): string {
  if (!iso) return "Sin datos";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Hace instantes";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export function formatFecha(iso: string | null): string {
  if (!iso) return "Sin datos";
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${fecha} ${hora}`;
}

// ---------- Metadatos visuales ----------
export const SEVERITY_META: Record<Severidad, { label: string; dot: string; Icon: typeof AlertTriangle; badgeClass: string }> = {
  critica: { label: "Crítica", dot: "#dc2626", Icon: AlertTriangle, badgeClass: "bg-red-100 text-red-600" },
  alta: { label: "Alta", dot: "#ea580c", Icon: AlertCircle, badgeClass: "bg-orange-100 text-orange-600" },
  media: { label: "Media", dot: "#ca8a04", Icon: Bell, badgeClass: "bg-amber-100 text-amber-700" },
  baja: { label: "Baja", dot: "#16a34a", Icon: CheckCircle2, badgeClass: "bg-green-100 text-green-700" },
};

export const ESTADO_META: Record<EstadoAlerta, { label: string; badgeClass: string }> = {
  Activa: { label: "Activa", badgeClass: "bg-red-100 text-red-600" },
  PendienteConfirmacion: { label: "Pendiente por confirmar", badgeClass: "bg-amber-100 text-amber-700" },
  Resuelta: { label: "Resuelta", badgeClass: "bg-green-100 text-green-700" },
};

// ---------- Avatares (mismo patrón que Activos) ----------
const AVATAR_COLORS = ["bg-[#519d99]", "bg-orange-400", "bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-teal-500"];

export function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getAvatarColor(nombre: string) {
  const idx = (nombre.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ---------- Paginación (mismo patrón que Activos) ----------
export function getPageWindow(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
