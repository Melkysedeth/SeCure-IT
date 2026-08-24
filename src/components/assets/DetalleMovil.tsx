import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    ChevronRight, Smartphone, Tablet, MoreVertical, Trash2, MapPin,
    Pencil, Battery, Globe, HardDrive, Phone, User, Calendar, Bell,
} from "lucide-react";
import { useAlertsMoviles } from "../../hooks/useAlertsMoviles";
import RegisterAssetModal from "./RegisterAssetModal";
import ConfirmDialog from "../common/ConfirmDialog";
import { actualizarActivoMovil, darDeBajaActivoMovil } from "../../lib/assets";
import type { NuevoActivoForm, TipoDocumento } from "../../types";

type Estado = "en_linea" | "sin_conexion";

const estadoColor: Record<Estado, string> = { en_linea: "#22c55e", sin_conexion: "#ef4444" };
const estadoLabel: Record<Estado, string> = { en_linea: "En línea", sin_conexion: "Sin conexión" };
const estadoBadgeClass: Record<Estado, string> = {
    en_linea: "bg-green-100 text-green-700",
    sin_conexion: "bg-red-100 text-red-600",
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
    const isoConZ = iso.includes("Z") || iso.includes("+") ? iso : iso.replace(" ", "T") + "Z";
    return new Date(isoConZ).toLocaleString("es-CO", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        timeZone: "America/Bogota",
    });
}

interface MovilRaw {
    id: string;
    codigo: string;
    tipo: string | null;
    nombre_dispositivo: string | null;
    marca: string | null;
    modelo: string | null;
    android_version: string | null;
    ram_total_mb: number | null;
    ram_disponible_mb: number | null;
    almacenamiento_total_gb: number | null;
    almacenamiento_libre_gb: number | null;
    usuario_asignado: string | null;
    nombre_responsable: string | null;
    tipo_documento: TipoDocumento | null;
    numero_documento: string | null;
    departamento: string | null;
    imei: string | null;
    operador: string | null;
    numero_telefono: string | null;
    observaciones: string | null;
    fecha_registro: string | null;
    bateria_nivel: number | null;
    ip_local: string | null;
    latitud: number | null;
    longitud: number | null;
    timestamp_reporte: string | null;
    estado: string | null;
}

function mapDetalle(a: MovilRaw) {
    return {
        codigo: a.codigo,
        tipo: a.tipo ?? "—",
        nombre: a.nombre_dispositivo ?? "Sin nombre",
        marca: a.marca ?? "—",
        modelo: a.modelo ?? "—",
        androidVersion: a.android_version ? `Android ${a.android_version}` : "—",
        estado: (a.estado as Estado) ?? "sin_conexion",
        ramTotal: a.ram_total_mb != null ? `${a.ram_total_mb} MB` : "—",
        ramDisponible: a.ram_disponible_mb != null ? `${a.ram_disponible_mb} MB` : "—",
        almTotal: a.almacenamiento_total_gb != null ? `${a.almacenamiento_total_gb} GB` : "—",
        almLibre: a.almacenamiento_libre_gb != null ? `${a.almacenamiento_libre_gb} GB` : "—",
        usuario: a.nombre_responsable ?? a.usuario_asignado ?? "Sin asignar",
        usuarioReporta: a.usuario_asignado ?? "Sin datos",
        departamento: a.departamento ?? "—",
        documento: a.numero_documento ? `${a.tipo_documento ?? ""} ${a.numero_documento}`.trim() : "—",
        imei: a.imei ?? "—",
        operador: a.operador ?? "—",
        numeroTelefono: a.numero_telefono ?? "—",
        observaciones: a.observaciones ?? "—",
        fechaRegistro: formatDateTime(a.fecha_registro),
        bateria: a.bateria_nivel ?? null,
        ipLocal: a.ip_local ?? "—",
        lat: a.latitud ?? null,
        lng: a.longitud ?? null,
        ultimaConexion: timeAgo(a.timestamp_reporte),
        fechaUltimaConexion: formatDateTime(a.timestamp_reporte),
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
        <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-gray-100/70 p-5 hover:shadow-[0_6px_22px_rgba(0,0,0,0.1)] transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-[#519d99]" />
                <h3 className="text-sm font-semibold text-[#3d3d42]">{title}</h3>
            </div>
            {children}
        </div>
    );
}

interface Props {
    raw: MovilRaw;
    codigo: string;
    refetch: () => void;
}

export default function DetalleMovil({ raw, codigo, refetch }: Props) {
    const activo = useMemo(() => mapDetalle(raw), [raw]);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [tab, setTab] = useState<"info" | "historial">("info");
    const { data: alertasActivo, loading: loadingAlertas } = useAlertsMoviles({ activoId: raw?.id });

    const IconTipo = raw.tipo === "tablet" ? Tablet : Smartphone;

    const editFormData: NuevoActivoForm = {
        codigo: raw.codigo,
        nombre_equipo: raw.nombre_dispositivo ?? "",
        tipo: (raw.tipo as any) ?? "",
        serial: "",
        marca: raw.marca ?? "",
        modelo: raw.modelo ?? "",
        sistema_op: "",
        version_so: raw.android_version ?? "",
        dominio: "",
        nombre_responsable: raw.nombre_responsable ?? "",
        tipo_documento: raw.tipo_documento ?? "",
        numero_documento: raw.numero_documento ?? "",
        departamento: raw.departamento ?? "",
        sede_id: "",
        observaciones: raw.observaciones ?? "",
        procesador: "",
        memoria_ram: "",
        almacenamiento: "",
        direccion_mac: "",
        imei: raw.imei ?? "",
        numero_telefono: raw.numero_telefono ?? "",
    };

    async function handleGuardarEdicion(data: NuevoActivoForm) {
        await actualizarActivoMovil(raw.id, data);
        refetch();
        setEditOpen(false);
    }

    async function handleConfirmDelete() {
        setDeleting(true);
        setDeleteError(null);
        try {
            await darDeBajaActivoMovil(raw.id);
            navigate("/activos");
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "No se pudo dar de baja el activo.");
            setDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1.5 text-sm text-[#9898a0]">
                <Link to="/activos" className="hover:text-[#519d99] transition-colors">Activos</Link>
                <ChevronRight size={14} />
                <span className="text-[#3d3d42] font-medium">{activo.nombre} ({codigo})</span>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#519d99]/10 p-3 rounded-xl">
                            <IconTipo className="text-[#519d99]" size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold text-[#3d3d42]">{activo.nombre}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoBadgeClass[activo.estado]}`}>{estadoLabel[activo.estado]}</span>
                            </div>
                            <p className="text-sm text-[#9898a0]">
                                Código: {activo.codigo} · Tipo: {activo.tipo === "tablet" ? "Tablet" : "Celular"} · Departamento: {activo.departamento}
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
                                        onClick={() => { setMenuOpen(false); setConfirmOpen(true); setDeleteError(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={15} /> Dar de baja activo
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d42] hover:bg-gray-50 transition-colors"
                                    >
                                        <Pencil size={15} /> Editar activo
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <ConfirmDialog
                    open={confirmOpen}
                    title="Dar de baja activo"
                    message={`Esta acción eliminará permanentemente "${activo.nombre}" (${activo.codigo}), junto con todos sus reportes asociados. No se puede deshacer.`}
                    confirmLabel="Dar de baja"
                    loading={deleting}
                    error={deleteError}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setConfirmOpen(false); setDeleteError(null); }}
                />

                <RegisterAssetModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleGuardarEdicion} initialData={editFormData} />

                <div className="grid grid-cols-3 gap-5">
                    <div
                        className="rounded-xl p-5 flex items-center justify-between border"
                        style={{ backgroundColor: `${estadoColor[activo.estado]}33`, borderColor: `${estadoColor[activo.estado]}80` }}
                    >
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: estadoColor[activo.estado] }}>Estado actual</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: estadoColor[activo.estado] }} />
                                <span className="text-lg font-semibold text-[#3d3d42]">{estadoLabel[activo.estado]}</span>
                            </div>
                            <p className="text-xs text-[#9898a0] mt-1">Última conexión: {activo.ultimaConexion}</p>
                        </div>
                    </div>

                    <div className="rounded-xl p-5 flex items-center gap-4 border border-[#519d99]/50 bg-[#519d99]/20">
                        <div className="w-14 h-14 rounded-full bg-[#519d99] flex items-center justify-center text-white text-lg font-bold shrink-0">
                            {activo.usuario.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#519d99]">Responsable asignado</p>
                            <p className="text-base font-semibold text-[#3d3d42]">{activo.usuario}</p>
                            <p className="text-xs text-[#9898a0]">{activo.departamento}</p>
                        </div>
                    </div>

                    <div className="rounded-xl p-5 flex items-center gap-3 border border-gray-200 bg-gray-50 shadow-sm">
                        <div className="w-11 h-11 rounded-full bg-[#519d99]/15 flex items-center justify-center shrink-0">
                            <Battery size={22} className="text-[#519d99]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9898a0]">Batería</p>
                            <p className="text-lg font-semibold text-[#3d3d42]">{activo.bateria !== null ? `${activo.bateria}%` : "N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col">
                <div className="flex gap-1 px-1">
                    <button
                        onClick={() => setTab("info")}
                        className={`px-5 py-3 text-sm font-semibold rounded-t-xl border border-b-0 transition-all ${tab === "info"
                            ? "bg-[#f8f9fb] text-[#519d99] border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10"
                            : "bg-gray-100 text-[#9898a0] border-transparent mt-2 hover:bg-gray-200/70 hover:text-[#686971]"
                            }`}
                    >
                        Información del activo
                    </button>
                    <button
                        onClick={() => setTab("historial")}
                        className={`px-5 py-3 text-sm font-semibold rounded-t-xl border border-b-0 transition-all ${tab === "historial"
                            ? "bg-[#f8f9fb] text-[#519d99] border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10"
                            : "bg-gray-100 text-[#9898a0] border-transparent mt-2 hover:bg-gray-200/70 hover:text-[#686971]"
                            }`}
                    >
                        Histórico
                    </button>
                </div>

                <div className="bg-[#f8f9fb] rounded-2xl shadow-md border border-gray-100 p-6 -mt-px relative z-0">
                    {tab === "info" && (
                        <div className="grid grid-cols-3 gap-5 items-start">
                            <div className="flex flex-col gap-5">
                                <SectionCard title="Información del dispositivo" icon={IconTipo}>
                                    <InfoRow label="Código" value={activo.codigo} />
                                    <InfoRow label="Marca / Modelo" value={`${activo.marca} ${activo.modelo}`} />
                                    <InfoRow label="Versión de Android" value={activo.androidVersion} />
                                    <InfoRow label="Departamento" value={activo.departamento} />
                                    <InfoRow label="Fecha de registro" value={activo.fechaRegistro} />
                                </SectionCard>

                                <SectionCard title="Responsable" icon={User}>
                                    <InfoRow label="Nombre" value={activo.usuario} />
                                    <InfoRow label="Documento" value={activo.documento} />
                                    <InfoRow label="Usuario que reporta (agente)" value={activo.usuarioReporta} />
                                </SectionCard>
                            </div>

                            <div className="flex flex-col gap-5">
                                <SectionCard title="Datos de línea" icon={Phone}>
                                    <InfoRow label="IMEI" value={activo.imei} />
                                    <InfoRow label="Operador" value={activo.operador} />
                                    <InfoRow label="Número de teléfono" value={activo.numeroTelefono} />
                                </SectionCard>

                                <SectionCard title="Almacenamiento" icon={HardDrive}>
                                    <InfoRow label="RAM total" value={activo.ramTotal} />
                                    <InfoRow label="RAM disponible" value={activo.ramDisponible} />
                                    <InfoRow label="Almacenamiento total" value={activo.almTotal} />
                                    <InfoRow label="Almacenamiento libre" value={activo.almLibre} />
                                </SectionCard>
                            </div>

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
                                        <div className="h-48 rounded-lg bg-gray-50 flex items-center justify-center mb-3 text-xs text-[#9898a0]">Sin coordenadas registradas todavía</div>
                                    )}
                                    <InfoRow label="Latitud" value={activo.lat !== null ? activo.lat.toFixed(6) : "—"} />
                                    <InfoRow label="Longitud" value={activo.lng !== null ? activo.lng.toFixed(6) : "—"} />
                                    <InfoRowIcon icon={Globe} label="Dirección IP" value={activo.ipLocal} />
                                </SectionCard>
                            </div>
                        </div>
                    )}

                    {tab === "historial" && (
                        <div className="flex flex-col gap-5">
                            <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-gray-100/70">
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
                                            <th className="px-5 py-3 text-left">Batería</th>
                                            <th className="px-5 py-3 text-left">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 text-[#3d3d42]">{activo.fechaUltimaConexion}</td>
                                            <td className="px-5 py-3 text-[#686971] font-mono text-xs">{activo.ipLocal}</td>
                                            <td className="px-5 py-3 text-[#686971]">{activo.bateria !== null ? `${activo.bateria}%` : "N/A"}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${estadoBadgeClass[activo.estado]}`}>{estadoLabel[activo.estado]}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-gray-100/70">
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
                                                    <td className="px-5 py-3 text-[#686971] capitalize">{al.tipo?.replace("_", " ")}</td>
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
            </div>
        </div >
    );
}