import { useState, useMemo, type ReactNode } from "react";
import { Bell, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle2, X, MoreVertical, Laptop, Check, Ban } from "lucide-react";

// ---------- Types ----------
type Severidad = "critica" | "alta" | "media" | "baja";
type Estado = "Activa" | "Resuelta";

interface Alerta {
  id: string;
  severidad: Severidad;
  titulo: string;
  desc: string;
  activo: string;
  codigo: string;
  tipoActivo: string;
  usuario: string;
  rol: string;
  ciudad: string;
  fecha: string;
  hace: string;
  estado: Estado;
  tipoAlerta: string;
  ubicAnterior: string;
  ubicActual: string;
  dispositivo: string;
  agente: string;
}

// ---------- Mock data ----------
const ALERTS: Alerta[] = [
  {
    id: "ALT-2025-00041",
    severidad: "critica",
    titulo: "Equipo fuera de sede",
    desc: "El equipo salió del área permitida",
    activo: "HP EliteBook 840",
    codigo: "P155",
    tipoActivo: "Portátil",
    usuario: "Juan Pérez",
    rol: "Desarrollador",
    ciudad: "Barranquilla, Atlántico",
    fecha: "18/05/2025 09:24 AM",
    hace: "Hace 3 min",
    estado: "Activa",
    tipoAlerta: "Geocerca / Fuera de sede",
    ubicAnterior: "Oficina Norte, Bogotá, Cundinamarca",
    ubicActual: "Barranquilla, Atlántico, Colombia",
    dispositivo: "Windows 11 Pro (23H2)",
    agente: "SeCure-IT v1.2.4",
  },
  {
    id: "ALT-2025-00040",
    severidad: "alta",
    titulo: "Sin conexión prolongada",
    desc: "El equipo lleva más de 7 días sin conexión",
    activo: "Lenovo ThinkPad L14",
    codigo: "P098",
    tipoActivo: "Portátil",
    usuario: "María Gómez",
    rol: "Analista",
    ciudad: "Cali, Valle del Cauca",
    fecha: "18/05/2025 07:15 AM",
    hace: "Hace 2 horas",
    estado: "Activa",
    tipoAlerta: "Conectividad / Inactividad",
    ubicAnterior: "Sede Cali, Valle del Cauca",
    ubicActual: "Sede Cali, Valle del Cauca",
    dispositivo: "Windows 11 Pro (23H2)",
    agente: "SeCure-IT v1.2.3",
  },
  {
    id: "ALT-2025-00039",
    severidad: "media",
    titulo: "Cambio de usuario",
    desc: "Se detectó un nuevo usuario",
    activo: "Dell Latitude 5420",
    codigo: "P120",
    tipoActivo: "Portátil",
    usuario: "Andrés Vargas",
    rol: "Soporte TI",
    ciudad: "Medellín, Antioquia",
    fecha: "18/05/2025 05:10 AM",
    hace: "Hace 4 horas",
    estado: "Activa",
    tipoAlerta: "Usuario / Sesión",
    ubicAnterior: "Sede Medellín, Antioquia",
    ubicActual: "Sede Medellín, Antioquia",
    dispositivo: "Windows 10 Pro",
    agente: "SeCure-IT v1.2.4",
  },
  {
    id: "ALT-2025-00038",
    severidad: "media",
    titulo: "Batería baja",
    desc: "Nivel de batería por debajo del 20%",
    activo: "HP ProBook 450 G8",
    codigo: "P073",
    tipoActivo: "Portátil",
    usuario: "Laura Martínez",
    rol: "Contadora",
    ciudad: "Bogotá, Cundinamarca",
    fecha: "18/05/2025 03:10 AM",
    hace: "Hace 6 horas",
    estado: "Activa",
    tipoAlerta: "Hardware / Batería",
    ubicAnterior: "Sede Bogotá, Cundinamarca",
    ubicActual: "Sede Bogotá, Cundinamarca",
    dispositivo: "Windows 11 Pro (23H2)",
    agente: "SeCure-IT v1.2.2",
  },
  {
    id: "ALT-2025-00037",
    severidad: "alta",
    titulo: "Ingreso a zona no permitida",
    desc: "El equipo ingresó a una zona restringida",
    activo: "Lenovo ThinkPad E14",
    codigo: "P109",
    tipoActivo: "Portátil",
    usuario: "Carlos Ruiz",
    rol: "Comercial",
    ciudad: "Cúcuta, Norte de Santander",
    fecha: "17/05/2025 11:48 PM",
    hace: "Ayer, 11:48 PM",
    estado: "Activa",
    tipoAlerta: "Geocerca / Zona restringida",
    ubicAnterior: "Sede Cúcuta, Norte de Santander",
    ubicActual: "Zona restringida, Cúcuta",
    dispositivo: "Windows 11 Home",
    agente: "SeCure-IT v1.2.4",
  },
  {
    id: "ALT-2025-00036",
    severidad: "baja",
    titulo: "Conexión restablecida",
    desc: "El equipo volvió a conectarse",
    activo: "Dell Inspiron 15",
    codigo: "P067",
    tipoActivo: "Portátil",
    usuario: "Carolina López",
    rol: "Marketing",
    ciudad: "Bogotá, Cundinamarca",
    fecha: "17/05/2025 09:30 PM",
    hace: "Ayer, 09:30 PM",
    estado: "Resuelta",
    tipoAlerta: "Conectividad",
    ubicAnterior: "Sede Bogotá, Cundinamarca",
    ubicActual: "Sede Bogotá, Cundinamarca",
    dispositivo: "Windows 10 Pro",
    agente: "SeCure-IT v1.2.3",
  },
  {
    id: "ALT-2025-00035",
    severidad: "baja",
    titulo: "Actualización de sistema",
    desc: "El sistema operativo fue actualizado",
    activo: "HP EliteBook 830",
    codigo: "P191",
    tipoActivo: "Portátil",
    usuario: "Felipe Sánchez",
    rol: "Desarrollador",
    ciudad: "Bucaramanga, Santander",
    fecha: "17/05/2025 07:15 PM",
    hace: "Ayer, 07:15 PM",
    estado: "Resuelta",
    tipoAlerta: "Sistema",
    ubicAnterior: "Sede Bucaramanga, Santander",
    ubicActual: "Sede Bucaramanga, Santander",
    dispositivo: "Windows 11 Pro (23H2)",
    agente: "SeCure-IT v1.2.4",
  },
  {
    id: "ALT-2025-00034",
    severidad: "baja",
    titulo: "Inicio de sesión",
    desc: "Usuario inició sesión en el equipo",
    activo: "MacBook Air M1",
    codigo: "P133",
    tipoActivo: "Portátil",
    usuario: "Natalia Díaz",
    rol: "Diseñadora",
    ciudad: "Bogotá, Cundinamarca",
    fecha: "17/05/2025 06:20 PM",
    hace: "Ayer, 06:20 PM",
    estado: "Resuelta",
    tipoAlerta: "Usuario / Sesión",
    ubicAnterior: "Sede Bogotá, Cundinamarca",
    ubicActual: "Sede Bogotá, Cundinamarca",
    dispositivo: "macOS Sonoma",
    agente: "SeCure-IT v1.2.4",
  },
];

const SEVERITY_META: Record<Severidad, { label: string; dot: string; text: string; bg: string; border: string; Icon: typeof AlertTriangle }> = {
  critica: { label: "Crítica", dot: "#dc2626", text: "text-red-600", bg: "bg-red-50", border: "border-red-100", Icon: AlertTriangle },
  alta: { label: "Alta", dot: "#ea580c", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", Icon: AlertCircle },
  media: { label: "Media", dot: "#ca8a04", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", Icon: Bell },
  baja: { label: "Baja", dot: "#16a34a", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", Icon: CheckCircle2 },
};

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const colors = ["#519d99", "#3d7a76", "#7c9a8e", "#8b7cae", "#a87c9a"];
  const idx = name.length % colors.length;
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ backgroundColor: colors[idx] }}>
      {initials}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const isActiva = estado === "Activa";
  return <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${isActiva ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>{estado}</span>;
}

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"Todas" | Estado>("Todas");
  const [severidadFilter, setSeveridadFilter] = useState<"Todas" | Severidad>("Todas");
  const [selected, setSelected] = useState<Set<string>>(new Set([ALERTS[0].id]));
  const [activeAlertId, setActiveAlertId] = useState<string | null>(ALERTS[0].id);
  const [tab, setTab] = useState<"Detalles" | "Historial" | "Comentarios">("Detalles");
  const [data, setData] = useState<Alerta[]>(ALERTS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((a) => {
      if (search && !`${a.titulo} ${a.activo} ${a.usuario}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (estadoFilter !== "Todas" && a.estado !== estadoFilter) return false;
      if (severidadFilter !== "Todas" && a.severidad !== severidadFilter) return false;
      return true;
    });
  }, [data, search, estadoFilter, severidadFilter]);

  const counts = useMemo(
    () => ({
      total: data.length,
      critica: data.filter((a) => a.severidad === "critica").length,
      alta: data.filter((a) => a.severidad === "alta").length,
      media: data.filter((a) => a.severidad === "media").length,
      baja: data.filter((a) => a.severidad === "baja").length,
      activas: data.filter((a) => a.estado === "Activa").length,
    }),
    [data],
  );

  const activeAlert = data.find((a) => a.id === activeAlertId);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateEstado(id: string, estado: Estado) {
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a)));
  }

  const kpis = [
    { label: "Total alertas", sub: "Todas las alertas", value: counts.total, Icon: Bell, bg: "bg-teal-50", color: "#519d99" },
    { label: "Críticas", sub: "Requieren atención inmediata", value: counts.critica, Icon: AlertTriangle, bg: "bg-red-50", color: "#dc2626" },
    { label: "Altas", sub: "Alta prioridad", value: counts.alta, Icon: AlertCircle, bg: "bg-orange-50", color: "#ea580c" },
    { label: "Medias", sub: "Atención recomendada", value: counts.media, Icon: Bell, bg: "bg-amber-50", color: "#ca8a04" },
    { label: "Bajas", sub: "Informativas", value: counts.baja, Icon: CheckCircle2, bg: "bg-emerald-50", color: "#16a34a" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header (título + descripción) — usa esto SOLO si tu Layout no ya muestra un título de página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#519d99]/10 p-2 rounded-lg">
            <Bell className="text-[#519d99]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3d3d42] leading-tight">Alertas</h1>
            <p className="text-sm text-[#9898a0]">Monitorea y gestiona las alertas generadas por los activos.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 min-h-0">
        {/* Content */}
        <main className="flex-1 flex flex-col gap-6">
          {/* KPI cards */}
          <div className="grid grid-cols-5 gap-4 gap-6">
            {kpis.map(({ label, sub, value, Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                <div className={`${bg} p-2.5 rounded-lg shrink-0`}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#686971]">{label}</div>
                  <div className="text-xl font-bold text-[#3d3d42] leading-tight">{value}</div>
                  <div className="text-[10px] text-[#9898a0] truncate">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 gap-6 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b0b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar alerta..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
              />
            </div>

            <FilterSelect label="Estado" value={estadoFilter} onChange={(v) => setEstadoFilter(v as "Todas" | Estado)} options={["Todas", "Activa", "Resuelta"]} />
            <FilterSelect
              label="Severidad"
              value={severidadFilter}
              onChange={(v) => setSeveridadFilter(v as "Todas" | Severidad)}
              options={["Todas", "critica", "alta", "media", "baja"]}
              display={(v) => (v === "Todas" ? v : SEVERITY_META[v as Severidad].label)}
            />
            <FilterSelect label="Tipo de alerta" value="Todas" onChange={() => {}} options={["Todas"]} />
            <FilterSelect label="Activo" value="Todos" onChange={() => {}} options={["Todos"]} />

            <button className="flex items-center gap-2 px-3.5 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] hover:bg-gray-50">
              <Filter size={14} /> Filtros
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase text-[#9898a0] tracking-wide">
                  <th className="w-10 py-3 pl-4"></th>
                  <th className="text-left py-3 px-2">Severidad</th>
                  <th className="text-left py-3 px-2">Alerta</th>
                  <th className="text-left py-3 px-2">Activo</th>
                  <th className="text-left py-3 px-2">Usuario</th>
                  <th className="text-left py-3 px-2">Ubicación</th>
                  <th className="text-left py-3 px-2">Fecha/Hora</th>
                  <th className="text-left py-3 px-2">Estado</th>
                  <th className="w-8 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const m = SEVERITY_META[a.severidad];
                  const isActiveRow = a.id === activeAlertId;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setActiveAlertId(a.id)}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${isActiveRow ? "bg-teal-50/40" : "hover:bg-gray-50/70"}`}
                    >
                      <td className="pl-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="w-4 h-4 rounded accent-[#519d99]" />
                      </td>
                      <td className="px-2 py-3">
                        <m.Icon size={18} style={{ color: m.dot }} />
                      </td>
                      <td className="px-2 py-3 max-w-[180px]">
                        <div className="font-medium text-[#3d3d42] text-[13px]">{a.titulo}</div>
                        <div className="text-[11px] text-[#9898a0] truncate">{a.desc}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <Laptop size={14} className="text-[#9898a0]" />
                          <div>
                            <div className="text-[13px] text-[#3d3d42] leading-tight">{a.activo}</div>
                            <div className="text-[11px] text-[#9898a0] leading-tight">{a.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={a.usuario} />
                          <div>
                            <div className="text-[13px] text-[#3d3d42] leading-tight">{a.usuario}</div>
                            <div className="text-[11px] text-[#9898a0] leading-tight">{a.rol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-[12px] text-[#686971]">{a.ciudad}</td>
                      <td className="px-2 py-3">
                        <div className="text-[12px] text-[#3d3d42]">{a.hace}</div>
                        <div className="text-[11px] text-[#9898a0]">{a.fecha}</div>
                      </td>
                      <td className="px-2 py-3">
                        <EstadoBadge estado={a.estado} />
                      </td>
                      <td className="px-2 py-3 text-[#9898a0]">
                        <MoreVertical size={15} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-sm text-[#9898a0]">
                      No se encontraron alertas con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-[#9898a0]">
                Mostrando 1 a {filtered.length} de {data.length} resultados
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-md border border-gray-200 text-[#9898a0] hover:bg-gray-50">
                  <ChevronLeft size={14} />
                </button>
                {[1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 rounded-md text-xs font-medium ${n === page ? "bg-[#519d99] text-white" : "text-[#686971] hover:bg-gray-50"}`}>
                    {n}
                  </button>
                ))}
                <span className="text-[#9898a0] text-xs px-1">...</span>
                <button onClick={() => setPage(6)} className="w-7 h-7 rounded-md text-xs font-medium text-[#686971] hover:bg-gray-50">
                  6
                </button>
                <button onClick={() => setPage((p) => Math.min(6, p + 1))} className="p-1.5 rounded-md border border-gray-200 text-[#9898a0] hover:bg-gray-50">
                  <ChevronRight size={14} />
                </button>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-[#686971]">
                8 por página <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </main>

        {/* Detail panel */}
        {activeAlert && (
          <aside className="w-[340px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-[15px] font-semibold text-[#3d3d42] pr-2">{activeAlert.titulo}</h2>
                <button onClick={() => setActiveAlertId(null)} className="text-[#9898a0] hover:text-[#3d3d42] shrink-0">
                  <X size={16} />
                </button>
              </div>
              <EstadoBadge estado={activeAlert.estado} />
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#686971]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEVERITY_META[activeAlert.severidad].dot }} />
                {SEVERITY_META[activeAlert.severidad].label}
                <span className="text-[#d0d0d6]">•</span>
                ID: {activeAlert.id}
              </div>
            </div>

            <div className="flex border-b border-gray-100 px-5">
              {(["Detalles", "Historial", "Comentarios"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-1 py-3 mr-5 text-[13px] border-b-2 -mb-px transition-colors ${tab === t ? "border-[#519d99] text-[#519d99] font-medium" : "border-transparent text-[#9898a0]"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Detalles" && (
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <Laptop size={18} className="text-[#686971]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#3d3d42]">
                      {activeAlert.activo} ({activeAlert.codigo})
                    </div>
                    <div className="text-xs text-[#9898a0]">{activeAlert.tipoActivo}</div>
                  </div>
                </div>

                <DetailField label="Descripción">{activeAlert.desc}</DetailField>
                <DetailField label="Usuario">
                  {activeAlert.usuario} ({activeAlert.rol})
                </DetailField>
                <DetailField label="Ubicación anterior">{activeAlert.ubicAnterior}</DetailField>
                <DetailField label="Ubicación actual" action="Ver mapa">
                  {activeAlert.ubicActual}
                </DetailField>
                <DetailField label="Fecha y hora" sub={activeAlert.hace}>
                  {activeAlert.fecha}
                </DetailField>
                <DetailField label="Tipo de alerta">{activeAlert.tipoAlerta}</DetailField>
                <DetailField label="Estado">
                  <span className={`inline-flex items-center gap-1.5 ${activeAlert.estado === "Activa" ? "text-red-500" : "text-emerald-600"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" /> {activeAlert.estado}
                  </span>
                </DetailField>
                <DetailField label="Dispositivo">{activeAlert.dispositivo}</DetailField>
                <DetailField label="Agente">{activeAlert.agente}</DetailField>
              </div>
            )}

            {tab === "Historial" && (
              <div className="p-5 text-sm text-[#9898a0]">Aquí se mostrará la línea de tiempo de eventos de esta alerta (creación, cambios de estado, comentarios del sistema).</div>
            )}

            {tab === "Comentarios" && <div className="p-5 text-sm text-[#9898a0]">Aún no hay comentarios en esta alerta.</div>}

            <div className="mt-auto p-5 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => updateEstado(activeAlert.id, "Resuelta")}
                disabled={activeAlert.estado === "Resuelta"}
                className="w-full bg-[#519d99] hover:bg-[#3d7a76] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check size={15} /> Marcar como resuelta
              </button>
              <button
                onClick={() => updateEstado(activeAlert.id, "Resuelta")}
                className="w-full border border-gray-200 text-[#686971] hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Ban size={15} /> Ignorar alerta
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  display?: (value: string) => string;
}

function FilterSelect({ value, onChange, options, display }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] bg-white focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {display ? display(o) : o}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" />
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  sub?: string;
  action?: string;
}

function DetailField({ label, children, sub, action }: DetailFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[#9898a0] mb-0.5">{label}</div>
        {action && <button className="text-[11px] text-[#519d99] font-medium hover:underline">{action}</button>}
      </div>
      <div className="text-[13px] text-[#3d3d42]">{children}</div>
      {sub && <div className="text-[11px] text-[#9898a0]">{sub}</div>}
    </div>
  );
}
