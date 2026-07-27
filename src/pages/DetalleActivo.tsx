import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAssetDetail } from "../hooks/useAssetDetail";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ChevronRight, Laptop, MoreVertical, Trash2, MapPin, Cpu,
  Network, Pencil, Monitor, Calendar, Bell, Wifi, WifiOff, Battery, Globe
} from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";
import { useSedes } from "../hooks/useSedes";
import TrasladoTemporalModal from "../components/assets/TrasladoTemporalModal";
import { ArrowLeftRight } from "lucide-react";
import RegisterAssetModal from "../components/assets/RegisterAssetModal";
import { darDeBajaActivo, actualizarActivo, asignarTrasladoTemporal, cancelarTrasladoTemporal } from "../lib/assets";
import type { NuevoActivoForm, TipoDocumento } from "../types";

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

const estadoIcon: Record<Estado, React.ElementType> = {
  en_linea: Wifi,
  sin_conexion: WifiOff,
  fuera_sede: MapPin,
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
  // Supabase devuelve "YYYY-MM-DD HH:mm:ss.SSS" sin sufijo de zona horaria.
  // Sin 'Z' al final, el navegador lo interpreta como hora LOCAL en vez de UTC.
  const isoConZ = iso.includes("Z") || iso.includes("+") ? iso : iso.replace(" ", "T") + "Z";
  return new Date(isoConZ).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

interface ActivoRaw {
  id: string;
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
  sede_temporal_id: string | null;
  sede_temporal_hasta: string | null;
  version_so: string | null;
  dominio: string | null;
  tipo_documento: TipoDocumento | null;
  numero_documento: string | null;
  sede_id: string | null;
  sede_nombre: string | null;
  sede_fija_nombre: string | null;
  observaciones: string | null;
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
    usuario_reporta: a.usuario_activo ?? "Sin datos",
    sede_asignada: a.sede_fija_nombre ?? "Sin asignar",
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
    sede_temporal_id: a.sede_temporal_id ?? null,
    sede_temporal_hasta: a.sede_temporal_hasta ?? null,
    traslado_vigente: Boolean(a.sede_temporal_id && a.sede_temporal_hasta && new Date(a.sede_temporal_hasta) > new Date()),
    traslado_hasta_fmt: a.sede_temporal_hasta
      ? new Date(a.sede_temporal_hasta).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Bogota" })
      : "—",
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

function InfoRowIcon({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="flex items-center gap-2 text-xs text-[#9898a0]">
        <Icon size={14} className="text-[#519d99]" />
        {label}
      </span>
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
  const { data: raw, loading, error, refetch } = useAssetDetail(codigo);
  const activo = useMemo(() => (raw ? mapDetalle(raw) : null), [raw]);
  const { data: alertasActivo, loading: loadingAlertas } = useAlerts({ activoId: raw?.id });

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: sedes } = useSedes();
  const [trasladoOpen, setTrasladoOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const editFormData: NuevoActivoForm | null = raw
    ? {
      codigo: raw.codigo,
      nombre_equipo: raw.nombre_equipo ?? "",
      tipo: (raw.tipo as any) ?? "",
      serial: raw.serial ?? "",
      marca: raw.marca ?? "",
      modelo: raw.modelo ?? "",
      sistema_op: raw.sistema_op ?? "",
      version_so: raw.version_so ?? "",
      dominio: raw.dominio ?? "",
      nombre_responsable: raw.nombre_responsable ?? "",
      tipo_documento: raw.tipo_documento ?? "",
      numero_documento: raw.numero_documento ?? "",
      departamento: raw.departamento ?? "",
      sede_id: raw.sede_id ?? "",
      observaciones: raw.observaciones ?? "",
      procesador: raw.procesador ?? "",
      memoria_ram: raw.memoria_ram ?? "",
      almacenamiento: raw.almacenamiento ?? "",
      direccion_mac: raw.direccion_mac ?? "",
    }
    : null;

  async function handleGuardarEdicion(data: NuevoActivoForm) {
    if (!raw?.id) return;
    await actualizarActivo(raw.id, data);
    refetch();
    setEditOpen(false);
  }

  async function handleGuardarTraslado(sedeTemporalId: string, sedeTemporalHasta: string) {
    if (!raw?.id) return;
    await asignarTrasladoTemporal(raw.id, sedeTemporalId, sedeTemporalHasta);
    refetch?.();
  }

  async function handleCancelarTraslado() {
    if (!raw?.id) return;
    await cancelarTrasladoTemporal(raw.id);
    refetch?.();
  }

  async function handleConfirmDelete() {
    if (!raw?.id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await darDeBajaActivo(raw.id);
      navigate("/activos");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo dar de baja el activo.");
      setDeleting(false);
    }
  }

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
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <MoreVertical size={16} />
            Acciones
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                    setDeleteError(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                  Dar de baja activo
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d42] hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={15} />
                  Editar activo
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setTrasladoOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d42] hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftRight size={15} />
                  {activo.traslado_vigente ? "Traslado Temporal" : "Traslado Temporal"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Dar de baja activo"
        message={`Esta acción eliminará permanentemente "${activo.nombre}" (${activo.codigo}), junto con todos sus reportes y alertas asociadas. No se puede deshacer.`}
        confirmLabel="Dar de baja"
        loading={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteError(null);
        }}
      />

      <RegisterAssetModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleGuardarEdicion}
        initialData={editFormData}
      />

      <TrasladoTemporalModal
        key={`${raw?.sede_temporal_id ?? "none"}-${raw?.sede_temporal_hasta ?? "none"}`}
        open={trasladoOpen}
        activoNombre={activo.nombre}
        sedes={sedes}
        sedeTemporalActualId={raw?.sede_temporal_id}
        sedeTemporalActualHasta={raw?.sede_temporal_hasta}
        onClose={() => setTrasladoOpen(false)}
        onSave={handleGuardarTraslado}
        onCancelarTraslado={raw?.sede_temporal_id ? handleCancelarTraslado : undefined}
      />

      {/* Estado y Usuario asignado destacados */}
      <div className="grid grid-cols-3 gap-5">
        <div
          className="rounded-xl p-5 flex items-center justify-between border"
          style={{ backgroundColor: `${estadoColor[activo.estado]}14`, borderColor: `${estadoColor[activo.estado]}33` }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: estadoColor[activo.estado] }}>
              Estado actual
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: estadoColor[activo.estado] }} />
              <span className="text-lg font-semibold text-[#3d3d42]">{estadoLabel[activo.estado]}</span>
            </div>
            <p className="text-xs text-[#9898a0] mt-1">Última conexión: {activo.ultima_conexion}</p>
            <p className="text-xs text-[#9898a0]">Reportado por: {activo.usuario_reporta}</p>
            {activo.traslado_vigente && (
              <p className="text-[11px] font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mt-2 inline-block">
                Traslado autorizado a {raw?.sede_nombre ?? "sede destino"} hasta {activo.traslado_hasta_fmt}
              </p>
            )}
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${estadoColor[activo.estado]}22` }}>
            {(() => {
              const Icon = estadoIcon[activo.estado];
              return <Icon size={26} style={{ color: estadoColor[activo.estado] }} />;
            })()}
          </div>
        </div>

        <div className="rounded-xl p-5 flex items-center gap-4 border border-[#519d99]/20 bg-[#519d99]/5">
          <div className="w-14 h-14 rounded-full bg-[#519d99] flex items-center justify-center text-white text-lg font-bold shrink-0">
            {activo.usuario
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#519d99]">Usuario asignado</p>
            <p className="text-base font-semibold text-[#3d3d42]">{activo.usuario}</p>
            <p className="text-xs text-[#9898a0]">{activo.cargo}</p>
          </div>
        </div>
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
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "historial" ? "border-[#519d99] text-[#519d99]" : "border-transparent text-[#9898a0] hover:text-[#3d3d42]"
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
            <SectionCard title="Información del equipo" icon={Monitor}>
              <InfoRow label="Código" value={activo.codigo} />
              <InfoRow label="Número de serie" value={activo.serial} />
              <InfoRow label="Marca / Modelo" value={`${activo.marca} ${activo.modelo}`} />
              <InfoRow label="Tipo de activo" value={activo.tipo} />
              <InfoRow label="Departamento" value={activo.departamento} />
              <InfoRow label="Fecha de registro" value={activo.fecha_registro} />
              <InfoRow label="Sede asignada" value={activo.sede_asignada} />
              <InfoRow label="Usuario que reporta (agente)" value={activo.usuario_reporta} />
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
              <InfoRowIcon icon={Battery} label="Batería" value={activo.bateria !== null ? `${activo.bateria}%` : "N/A"} />
              <InfoRowIcon icon={Globe} label="Dirección IP" value={activo.ip_local} />
              <InfoRowIcon icon={Wifi} label="Red WiFi" value={activo.red_wifi} />
              <InfoRowIcon icon={Monitor} label="Sistema operativo" value={activo.sistema_op} />
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
