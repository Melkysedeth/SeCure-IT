import { useState, useMemo } from "react";
import { Map as MapIcon, Search, SlidersHorizontal, X, MapPin, Laptop } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAssets } from "../hooks/useAssets";

// ── Tipos y datos mock ──────────────────────────────
type Estado = "en_linea" | "sin_conexion" | "fuera_sede";

interface ActivoMapa {
  codigo: string;
  nombre: string;
  usuario: string;
  cargo: string;
  ciudad: string;
  sede: string;
  estado: Estado;
  bateria: number | null;
  ip: string;
  ultima_conexion: string;
  sistema_op: string;
  tipo: string;
}

interface CiudadGrupo {
  key: string;
  nombre: string;
  lat: number;
  lng: number;
  activos: ActivoMapa[];
}

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

function mapActivo(a: any): ActivoMapa {
  return {
    codigo: a.codigo,
    nombre: a.nombre_equipo ?? "Sin nombre",
    usuario: a.nombre_responsable ?? a.usuario_activo ?? "Sin asignar",
    cargo: a.departamento ?? "",
    ciudad: a.ubicacion_ciudad ?? a.ciudad_asignada ?? "—",
    sede: a.ciudad_asignada ?? "—",
    estado: (a.estado as Estado) ?? "sin_conexion",
    bateria: a.bateria ?? null,
    ip: a.ip_publica ?? a.ip_local ?? "—",
    ultima_conexion: timeAgo(a.timestamp_reporte),
    sistema_op: a.sistema_op ?? "—",
    tipo: a.tipo ?? "—",
  };
}

// Agrupa por sede (no por texto de ciudad): cada sede tiene coordenadas fijas
// en la tabla `sedes`, así que sus activos se apilan en un único punto exacto
// en vez de promediar latitudes/longitudes de reportes individuales (eso
// producía puntos "fantasma" cuando dos activos compartían ciudad pero tenían
// coordenadas distintas o ruidosas).
function agruparPorCiudad(data: any[]): CiudadGrupo[] {
  const grupos = new Map<string, { nombre: string; lat: number; lng: number; activos: ActivoMapa[] }>();

  for (const raw of data) {
    const key = raw.sede_id ?? raw.ubicacion_ciudad ?? raw.ciudad_asignada;
    const nombre = raw.sede_nombre ?? raw.ubicacion_ciudad ?? raw.ciudad_asignada;
    const lat = raw.sede_latitud ?? raw.latitud;
    const lng = raw.sede_longitud ?? raw.longitud;
    if (!key || lat == null || lng == null) continue;

    const existente = grupos.get(key);
    const activoMapeado = mapActivo(raw);
    if (existente) {
      existente.activos.push(activoMapeado);
    } else {
      grupos.set(key, { nombre, lat, lng, activos: [activoMapeado] });
    }
  }

  return Array.from(grupos.entries()).map(([key, g]) => ({
    key,
    nombre: g.nombre,
    lat: g.lat,
    lng: g.lng,
    activos: g.activos,
  }));
}

function getRadius(cantidad: number) {
  return Math.max(16, Math.min(30, 14 + cantidad * 3));
}

function getColorPrincipal(activos: ActivoMapa[]) {
  if (activos.some((a) => a.estado === "sin_conexion")) return estadoColor.sin_conexion;
  if (activos.some((a) => a.estado === "fuera_sede")) return estadoColor.fuera_sede;
  return estadoColor.en_linea;
}

function RecenterButton() {
  const map = useMap();
  return (
    <button onClick={() => map.setView([7.5, -74.5], 6)} className="absolute bottom-24 right-3 z-[1000] bg-white shadow-md rounded-lg p-2 text-[#519d99] hover:bg-gray-50" title="Centrar mapa">
      <MapPin size={16} />
    </button>
  );
}

// ── Componente principal ──────────────────────────────
export default function Mapa() {
  const { data, loading } = useAssets();
  const ciudadesData = useMemo(() => agruparPorCiudad(data), [data]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selected, setSelected] = useState<ActivoMapa | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<Record<Estado, boolean>>({
    en_linea: true,
    sin_conexion: true,
    fuera_sede: true,
  });
  const [search, setSearch] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState("Todas");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");

  const totalEnLinea = ciudadesData.flatMap((c) => c.activos).filter((a) => a.estado === "en_linea").length;
  const totalSinConexion = ciudadesData.flatMap((c) => c.activos).filter((a) => a.estado === "sin_conexion").length;
  const totalFueraSede = ciudadesData.flatMap((c) => c.activos).filter((a) => a.estado === "fuera_sede").length;

  const searchLower = search.trim().toLowerCase();
  const ciudadesFiltradas = ciudadesData
    .filter((c) => ciudadFiltro === "Todas" || c.nombre === ciudadFiltro)
    .map((c) => ({
      ...c,
      activos: c.activos.filter((a) => {
        if (!estadoFiltro[a.estado]) return false;
        if (tipoFiltro !== "Todos" && a.tipo.toLowerCase() !== tipoFiltro.toLowerCase()) return false;
        if (!searchLower) return true;
        return a.nombre.toLowerCase().includes(searchLower) || a.codigo.toLowerCase().includes(searchLower) || a.usuario.toLowerCase().includes(searchLower);
      }),
    }))
    .filter((c) => c.activos.length > 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-sm text-[#9898a0]">Cargando mapa de activos...</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-[#519d99]/10 p-2 rounded-lg">
          <MapIcon className="text-[#519d99]" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#3d3d42]">Mapa de activos</h1>
          <p className="text-sm text-[#9898a0]">Visualiza la ubicación aproximada de tus activos.</p>
        </div>
      </div>

      {/* Barra superior: búsqueda + filtros + contadores */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a0]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar activo..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`border text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            filtersOpen ? "border-[#519d99] text-[#519d99] bg-[#519d99]/5" : "border-gray-200 text-[#686971] hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filtros
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#3d3d42] bg-white border border-gray-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500" /> En línea {totalEnLinea}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#3d3d42] bg-white border border-gray-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Sin conexión {totalSinConexion}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#3d3d42] bg-white border border-gray-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Fuera de sede {totalFueraSede}
          </span>
        </div>
      </div>

      {/* Cuerpo: filtros laterales + mapa + panel detalle */}
      <div className="flex-1 flex gap-4 min-h-[560px]">
        {/* Panel de filtros */}
        {filtersOpen && (
          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4 h-fit flex-shrink-0">
            <h3 className="text-sm font-semibold text-[#3d3d42]">Filtros</h3>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#686971]">Estado</p>
              {(Object.keys(estadoLabel) as Estado[]).map((estado) => (
                <label key={estado} className="flex items-center gap-2 text-sm text-[#3d3d42] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estadoFiltro[estado]}
                    onChange={() => setEstadoFiltro((f) => ({ ...f, [estado]: !f[estado] }))}
                    className="rounded border-gray-300 accent-[#519d99]"
                  />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: estadoColor[estado] }} />
                  {estadoLabel[estado]}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#686971]">Ciudad</label>
              <select
                value={ciudadFiltro}
                onChange={(e) => setCiudadFiltro(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30"
              >
                <option>Todas</option>
                {ciudadesData.map((c) => (
                  <option key={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#686971]">Tipo de activo</label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30"
              >
                <option>Todos</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
                <option value="celular">Celular</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEstadoFiltro({ en_linea: true, sin_conexion: true, fuera_sede: true });
                setSearch("");
                setCiudadFiltro("Todas");
                setTipoFiltro("Todos");
              }}
              className="text-xs text-[#519d99] font-medium hover:underline text-left"
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Mapa */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          <MapContainer center={[7.5, -74.5]} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterButton />
            {ciudadesFiltradas.map((ciudad) => (
              <CircleMarker
                key={ciudad.key}
                center={[ciudad.lat, ciudad.lng]}
                radius={getRadius(ciudad.activos.length)}
                pathOptions={{
                  fillColor: getColorPrincipal(ciudad.activos),
                  fillOpacity: 0.7,
                  color: "white",
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelected(ciudad.activos[0]),
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <span className="font-medium">
                    {ciudad.nombre}: {ciudad.activos.length} equipo{ciudad.activos.length > 1 ? "s" : ""}
                  </span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Leyenda */}
          <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow-md p-3 text-xs flex flex-col gap-1.5 z-[1000]">
            <p className="font-semibold text-[#3d3d42] mb-1">Leyenda</p>
            {(Object.keys(estadoLabel) as Estado[]).map((estado) => (
              <span key={estado} className="flex items-center gap-2 text-[#686971]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: estadoColor[estado] }} />
                {estadoLabel[estado]}
              </span>
            ))}
          </div>
        </div>

        {/* Panel de detalle */}
        {selected && (
          <div className="w-72 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-shrink-0">
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-[#519d99]/10 p-2 rounded-lg">
                  <Laptop className="text-[#519d99]" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3d3d42]">{selected.nombre}</p>
                  <span className="flex items-center gap-1.5 text-xs text-[#686971]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: estadoColor[selected.estado] }} />
                    {estadoLabel[selected.estado]}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#9898a0] hover:text-[#3d3d42]">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 p-4 text-sm">
              <div>
                <p className="text-[11px] text-[#9898a0]">Usuario</p>
                <p className="text-[#3d3d42] font-medium">{selected.usuario}</p>
                <p className="text-[11px] text-[#9898a0]">{selected.cargo}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9898a0]">Ubicación actual</p>
                <p className="text-[#3d3d42] font-medium">{selected.ciudad}</p>
                <p className="text-[11px] text-[#9898a0]">{selected.sede}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9898a0]">Última conexión</p>
                <p className="text-[#3d3d42] font-medium">{selected.ultima_conexion}</p>
              </div>
              {selected.bateria !== null && (
                <div>
                  <p className="text-[11px] text-[#9898a0]">Batería</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${selected.bateria}%` }} />
                    </div>
                    <span className="text-xs text-[#686971]">{selected.bateria}%</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] text-[#9898a0]">Dirección IP</p>
                <p className="text-[#3d3d42] font-medium">{selected.ip}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9898a0]">Sistema operativo</p>
                <p className="text-[#3d3d42] font-medium">{selected.sistema_op}</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <a href={`/activos/${selected.codigo}`} className="block text-center text-sm font-medium text-white bg-[#519d99] hover:bg-[#3d7a76] rounded-lg py-2 transition-colors">
                Ver detalle del activo →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
