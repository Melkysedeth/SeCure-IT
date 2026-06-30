import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronRight, Laptop, MoreVertical, User, MapPin, Cpu, Network, Monitor, Calendar, Shield } from "lucide-react";

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

// ── Mock de un activo (luego vendrá de Supabase por :codigo) ──
const mockActivo = {
  codigo: "P155",
  nombre: "HP EliteBook 840",
  tipo: "Laptop",
  estado: "en_linea" as Estado,
  serial: "5CD1234A8C",
  marca: "HP",
  modelo: "EliteBook 840 G8",
  departamento: "Tecnología / Desarrollo",
  fecha_registro: "15/03/2025",
  procesador: "Intel Core i5-1135G7 @ 2.40GHz",
  memoria_ram: "16 GB",
  almacenamiento: "512 GB SSD",
  direccion_mac: "00:1A:2B:3C:4D:5E",
  usuario: "Juan Pérez",
  cargo: "Desarrollador",
  ip_local: "192.168.1.100",
  red_wifi: "Empresa_WiFi",
  sistema_op: "Windows 11 Pro (23H2)",
  ciudad: "Bogotá, Cundinamarca",
  sede: "Oficina Norte",
  lat: 4.711,
  lng: -74.0721,
  bateria: 82,
  ultima_conexion: "Hace 2 minutos",
  fecha_ultima_conexion: "18/05/2025 09:24 AM",
};

const mockHistorial = [
  { fecha: "18/05/2025 09:24 AM", ip: "192.168.1.100", ubicacion: "Bogotá, Oficina Norte", bateria: 82, estado: "en_linea" as Estado },
  { fecha: "18/05/2025 05:24 AM", ip: "192.168.1.100", ubicacion: "Bogotá, Oficina Norte", bateria: 90, estado: "en_linea" as Estado },
  { fecha: "18/05/2025 01:24 AM", ip: "192.168.1.100", ubicacion: "Bogotá, Oficina Norte", bateria: 95, estado: "en_linea" as Estado },
  { fecha: "17/05/2025 09:24 PM", ip: "192.168.1.100", ubicacion: "Bogotá, Oficina Norte", bateria: 60, estado: "en_linea" as Estado },
  { fecha: "17/05/2025 05:24 PM", ip: "186.84.12.50", ubicacion: "Bogotá, Chapinero", bateria: 45, estado: "fuera_sede" as Estado },
];

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
  const activo = mockActivo; // luego: fetch por `codigo`

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
              Código: {activo.codigo} · Tipo: {activo.tipo} · Departamento: {activo.departamento.split(" / ")[0]}
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
          Historial de reportes
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
              <InfoRow label="Batería" value={`${activo.bateria}%`} />
              <InfoRow label="Dirección IP" value={activo.ip_local} />
              <InfoRow label="Red WiFi" value={activo.red_wifi} />
              <InfoRow label="Sistema operativo" value={activo.sistema_op} />
            </SectionCard>
          </div>

          {/* Columna 3 */}
          <div className="flex flex-col gap-5">
            <SectionCard title="Ubicación actual" icon={MapPin}>
              <div className="h-48 rounded-lg overflow-hidden mb-3">
                <MapContainer center={[activo.lat, activo.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[activo.lat, activo.lng]} radius={10} pathOptions={{ fillColor: estadoColor[activo.estado], fillOpacity: 0.8, color: "white", weight: 2 }} />
                </MapContainer>
              </div>
              <InfoRow label="Ciudad" value={activo.ciudad} />
              <InfoRow label="Sede" value={activo.sede} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* Contenido: Historial */}
      {tab === "historial" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar size={16} className="text-[#519d99]" />
            <h3 className="text-sm font-semibold text-[#3d3d42]">Historial de reportes</h3>
          </div>
          <p className="px-5 pt-3 text-xs text-[#9898a0]">El agente reporta cada 4-6 horas. Estos son los últimos reportes recibidos de este equipo.</p>
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
              {mockHistorial.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-[#3d3d42]">{r.fecha}</td>
                  <td className="px-5 py-3 text-[#686971] font-mono text-xs">{r.ip}</td>
                  <td className="px-5 py-3 text-[#686971]">{r.ubicacion}</td>
                  <td className="px-5 py-3 text-[#686971]">{r.bateria}%</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${estadoBadgeClass[r.estado]}`}>{estadoLabel[r.estado]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
