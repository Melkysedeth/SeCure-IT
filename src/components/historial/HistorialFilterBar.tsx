import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ESTADO_REPORTE_META, type EstadoReporte, type RangoFecha } from "../../lib/historial";

export interface HistorialFilters {
  search: string;
  estado: "Todos" | EstadoReporte;
  ciudad: string;
  rango: RangoFecha;
}

interface Props {
  filters: HistorialFilters;
  ciudades: string[];
  onChange: (filters: HistorialFilters) => void;
}

export const DEFAULT_HISTORIAL_FILTERS: HistorialFilters = {
  search: "",
  estado: "Todos",
  ciudad: "Todas",
  rango: "7dias",
};

const RANGO_OPTIONS: { value: RangoFecha; label: string }[] = [
  { value: "hoy", label: "Últimas 24 horas" },
  { value: "7dias", label: "Últimos 7 días" },
  { value: "30dias", label: "Últimos 30 días" },
  { value: "todo", label: "Todo el historial" },
];

const ESTADO_OPTIONS: { value: "Todos" | EstadoReporte; label: string }[] = [
  { value: "Todos", label: "Todos" },
  ...(Object.keys(ESTADO_REPORTE_META) as EstadoReporte[]).map((e) => ({ value: e, label: ESTADO_REPORTE_META[e].label })),
];

export default function HistorialFilterBar({ filters, ciudades, onChange }: Props) {
  function set<K extends keyof HistorialFilters>(key: K, value: HistorialFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4">
      <div className="w-140 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a0]" size={16} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por código, nombre o responsable..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
          />
        </div>
      </div>

      <div className="flex-1 min-w-[160px] flex flex-col gap-1">
        <label className="text-xs font-medium text-[#686971]">Periodo</label>
        <div className="relative">
          <select
            value={filters.rango}
            onChange={(e) => set("rango", e.target.value as RangoFecha)}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer"
          >
            {RANGO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 min-w-[140px] flex flex-col gap-1">
        <label className="text-xs font-medium text-[#686971]">Estado</label>
        <div className="relative">
          <select
            value={filters.estado}
            onChange={(e) => set("estado", e.target.value as "Todos" | EstadoReporte)}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer"
          >
            {ESTADO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 min-w-[140px] flex flex-col gap-1">
        <label className="text-xs font-medium text-[#686971]">Ciudad</label>
        <div className="relative">
          <select
            value={filters.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer"
          >
            <option value="Todas">Todas</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" size={14} />
        </div>
      </div>

      <button
        onClick={() => onChange(DEFAULT_HISTORIAL_FILTERS)}
        className="flex-shrink-0 border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal size={15} />
        Limpiar filtros
      </button>
    </div>
  );
}
