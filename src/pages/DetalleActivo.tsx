import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAssetDetail } from "../hooks/useAssetDetail";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronRight, Laptop, MoreVertical, User, MapPin, Cpu, Network, Monitor, Calendar, Shield, Bell } from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";

type Estado = "en_linea" | "sin_conexion" | "fuera_sede";

const estadoColor: Record<Estado, string> = {
  en_linea: "#22c55e",
  sin_conexion: "#ef4444",
  fuera_sede: "#f97316",
};

const estadoLabel: Record<Estado, string> = {
  en_linea: "En línea",
  sin_conexion: "Sin conexión",
  fuera_sede: "Fuera de sede",
};

const estadoBadgeClass: Record<Estado, string> = {
  en_linea: "bg-green-100 text-green-700",
  sin_conexion: "bg-red-100 text-red-600",
  fuera_sede: "bg-orange-100 text-orange-600",
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

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActivoRaw {
  codigo: string;
  nombre_equipo: string | null;
  tipo: string | null;
  estado: string | null;
  serial: string | null;
  marca: string | null;
  modelo: string | null;
  departamento: string | null;
  fecha_registro: string | null;
  procesador: string | null;
  memoria_ram: string | null;
  almacenamiento: string | null;
  direccion_mac: string | null;
  nombre_responsable: string | null;
  usuario_activo: string | null;
  ip_local: string | null;
  red_wifi: string | null;
  sistema_op: string | null;
  ubicacion_ciudad: string | null;
  ciudad_asignada: string | null;
  latitud: number | null;
  longitud: number | null;
  bateria: number | null;
  timestamp_reporte: string | null;
}

function mapDetalle(a: ActivoRaw) {
  return {
    codigo: a.codigo,
    nombre: a.nombre_equipo ?? "Sin nombre",
    tipo: a.tipo ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    serial: a.serial ?? "—",
    marca: a.marca ?? "—",
    modelo: a.modelo ?? "—",
    departamento: a.departamento ?? "—",
    fecha_registro: formatDateTime(a.fecha_registro),
    procesador: a.procesador ?? "—",
    memoria_ram: a.memoria_ram ?? "—",
    almacenamiento: a.almacenamiento ?? "—",
    direccion_mac: a.direccion_mac ?? "—",
    usuario: a.nombre_responsable ?? a.usuario_activo ?? "Sin asignar",
    cargo: a.departamento ?? "",
    ip_local: a.ip_local ?? "—",
    red_wifi: a.red_wifi ?? "—",
    sistema_op: a.sistema_op ?? "—",
    ciudad: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    sede: a.ciudad_asignada ?? "—",
    lat: a.latitud ?? null,
    lng: a.longitud ?? null,
    bateria: a.bateria ?? null,
    ultima_conexion: timeAgo(a.timestamp_reporte),
    fecha_ultima_conexion: formatDateTime(a.timestamp_reporte),
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-[#9898a0]">{label}</span>
      <span className="text-sm text-[#3d3d42] font-medium text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-[#519d99]" />
        <h3 className="text-sm font-semibold text-[#3d3d42]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DetalleActivo() {
  const { codigo } = useParams();
  const [tab, setTab] = useState<"info" | "historial">("info");
  const { data: raw, loading, error } = useAssetDetail(codigo);
  const activo = useMemo(() => (raw ? mapDetalle(raw) : null), [raw]);
  const { data: alertasActivo, loading: loadingAlertas } = useAlerts({ activoId: raw?.id });

  if (loading) {
    return <div className="p-10 text-center text-sm text-[#9898a0]">Cargando activo...</div>;
  }
  if (error) {
    return <div className="p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }
  if (!activo) {
    return (
      <div className="p-10 text-center text-sm text-[#9898a0]">
        No se encontró ningún activo con el código <strong>{codigo}</strong>.{" "}
        <Link to="/activos" className="text-[#519d99] hover:underline">
          Volver a Activos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[#9898a0]">
        <Link to="/activos" className="hover:text-[#519d99] transition-colors">
          Activos
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#3d3d42] font-medium">
          {activo.nombre} ({codigo})
        </span>
      </div>

      {/* Header del activo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#519d99]/10 p-3 rounded-xl">
            <Laptop className="text-[#519d99]" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[#3d3d42]">{activo.nombre}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoBadgeClass[activo.estado]}`}>{estadoLabel[activo.estado]}</span>
            </div>
            <p className="text-sm text-[#9898a0]">
              Código: {activo.codigo} · Tipo: {activo.tipo} · Departamento: {activo.departamento}
            </p>
          </div>
        </div>
        <button className="border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <MoreVertical size={16} />
          Acciones
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab("info")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "info" ? "border-[#519d99] text-[#519d99]" : "border-transparent text-[#9898a0] hover:text-[#3d3d42]"}`}
        >
          Información del activo
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "historial" ? "border-[#519d99] text-[#519d99]" : "border-transparent text-[#9898a0] hover:text-[#3d3d42]"
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Contenido: Información */}
      {tab === "info" && (
        <div className="grid grid-cols-3 gap-5 items-start">
          {/* Columna 1 */}
          <div className="flex flex-col gap-5">
            <SectionCard title="Estado actual" icon={Shield}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: estadoColor[activo.estado] }} />
                <span className="text-sm font-medium text-[#3d3d42]">{estadoLabel[activo.estado]}</span>
              </div>
              <p className="text-xs text-[#9898a0]">Última conexión: {activo.ultima_conexion}</p>
              <p className="text-[11px] text-[#9898a0]">{activo.fecha_ultima_conexion}</p>
            </SectionCard>

            <SectionCard title="Usuario asignado" icon={User}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#519d99] flex items-center justify-center text-white text-sm font-bold">
                  {activo.usuario
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3d3d42]">{activo.usuario}</p>
                  <p className="text-xs text-[#9898a0]">{activo.cargo}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Información del equipo" icon={Monitor}>
              <InfoRow label="Código" value={activo.codigo} />
              <InfoRow label="Número de serie" value={activo.serial} />
              <InfoRow label="Marca / Modelo" value={`${activo.marca} ${activo.modelo}`} />
              <InfoRow label="Tipo de activo" value={activo.tipo} />
              <InfoRow label="Departamento" value={activo.departamento} />
              <InfoRow label="Fecha de registro" value={activo.fecha_registro} />
            </SectionCard>
          </div>

          {/* Columna 2 */}
          <div className="flex flex-col gap-5">
            <SectionCard title="Hardware" icon={Cpu}>
              <InfoRow label="Procesador" value={activo.procesador} />
              <InfoRow label="Memoria RAM" value={activo.memoria_ram} />
              <InfoRow label="Almacenamiento" value={activo.almacenamiento} />
              <InfoRow label="Dirección MAC" value={activo.direccion_mac} />
            </SectionCard>

            <SectionCard title="Información rápida" icon={Network}>
              <InfoRow label="Batería" value={activo.bateria !== null ? `${activo.bateria}%` : "N/A"} />
              <InfoRow label="Dirección IP" value={activo.ip_local} />
              <InfoRow label="Red WiFi" value={activo.red_wifi} />
              <InfoRow label="Sistema operativo" value={activo.sistema_op} />
            </SectionCard>
          </div>

          {/* Columna 3 */}
          <div className="flex flex-col gap-5">
            <SectionCard title="Ubicación actual" icon={MapPin}>
              {activo.lat !== null && activo.lng !== null ? (
                <div className="h-48 rounded-lg overflow-hidden mb-3">
                  <MapContainer center={[activo.lat, activo.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <CircleMarker center={[activo.lat, activo.lng]} radius={10} pathOptions={{ fillColor: estadoColor[activo.estado], fillOpacity: 0.8, color: "white", weight: 2 }} />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-48 rounded-lg bg-gray-50 flex items-center justify-center mb-3 text-xs text-[#9898a0]">Sin coordenadas registradas</div>
              )}
              <InfoRow label="Ciudad" value={activo.ciudad} />
              <InfoRow label="Sede" value={activo.sede} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* Contenido: Historial */}
      {tab === "historial" && (
        <div className="flex flex-col gap-5">
          {/* Último reporte */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Calendar size={16} className="text-[#519d99]" />
              <h3 className="text-sm font-semibold text-[#3d3d42]">Último reporte recibido</h3>
            </div>
            <p className="px-5 pt-3 pb-1 text-xs text-[#9898a0]">El sistema guarda únicamente el reporte más reciente de cada equipo.</p>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 text-left">Fecha y hora</th>
                  <th className="px-5 py-3 text-left">Dirección IP</th>
                  <th className="px-5 py-3 text-left">Ubicación</th>
                  <th className="px-5 py-3 text-left">Batería</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-[#3d3d42]">{activo.fecha_ultima_conexion}</td>
                  <td className="px-5 py-3 text-[#686971] font-mono text-xs">{activo.ip_local}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.ciudad}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.bateria !== null ? `${activo.bateria}%` : "N/A"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${estadoBadgeClass[activo.estado]}`}>{estadoLabel[activo.estado]}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Historial de alertas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Bell size={16} className="text-[#519d99]" />
              <h3 className="text-sm font-semibold text-[#3d3d42]">Historial de alertas</h3>
            </div>
            {loadingAlertas && <p className="px-5 py-4 text-xs text-[#9898a0]">Cargando alertas...</p>}
            {!loadingAlertas && alertasActivo.length === 0 && <p className="px-5 py-4 text-xs text-[#9898a0]">Este equipo no ha generado alertas.</p>}
            {!loadingAlertas && alertasActivo.length > 0 && (
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
                    <th className="px-5 py-3 text-left">Fecha</th>
                    <th className="px-5 py-3 text-left">Tipo</th>
                    <th className="px-5 py-3 text-left">Severidad</th>
                    <th className="px-5 py-3 text-left">Descripción</th>
                    <th className="px-5 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alertasActivo.map((al: any) => (
                    <tr key={al.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-[#3d3d42]">{formatDateTime(al.created_at)}</td>
                      <td className="px-5 py-3 text-[#686971] capitalize">{al.tipo.replace("_", " ")}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${al.severidad === "critica" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                          {al.severidad}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#686971]">{al.descripcion}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${al.estado === "activa" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>{al.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
