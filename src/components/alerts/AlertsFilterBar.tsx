import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useAlerts } from "../../hooks/useAlerts";
import { mapAlerta, SEVERITY_META, type Severidad } from "../../lib/alerts";

export interface AlertsFilters {
  search: string;
  estado: "Todos" | "Activa" | "PendienteConfirmacion" | "Resuelta";
  severidad: "Todas" | Severidad;
  tipo: string;
  ciudad: string;
}

interface Props {
  filters: AlertsFilters;
  onChange: (filters: AlertsFilters) => void;
}

const estadoOptions = [
  { value: "Todos", label: "Todos" },
  { value: "Activa", label: "Activa" },
  { value: "PendienteConfirmacion", label: "Pendiente por confirmar" },
  { value: "Resuelta", label: "Resuelta" },
];

const severidadOptions = [{ value: "Todas", label: "Todas" }, ...(Object.keys(SEVERITY_META) as Severidad[]).map((s) => ({ value: s, label: SEVERITY_META[s].label }))];

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  const set = new Set(values.filter((v): v is string => !!v && v.trim() !== ""));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export const DEFAULT_ALERTS_FILTERS: AlertsFilters = {
  search: "",
  estado: "Todos",
  severidad: "Todas",
  tipo: "Todos",
  ciudad: "Todas",
};

export default function AlertsFilterBar({ filters, onChange }: Props) {
  const { data } = useAlerts();
  const mapped = useMemo(() => data.map(mapAlerta), [data]);

  const tipos = useMemo(() => uniqueSorted(mapped.map((a) => a.tipo)), [mapped]);
  const ciudades = useMemo(() => uniqueSorted(mapped.map((a) => a.ciudad)), [mapped]);

  function set<K extends keyof AlertsFilters>(key: K, value: AlertsFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const selects: { key: keyof AlertsFilters; label: string; options: { value: string; label: string }[] }[] = [
    { key: "estado", label: "Estado", options: estadoOptions },
    { key: "severidad", label: "Severidad", options: severidadOptions },
    { key: "tipo", label: "Tipo de alerta", options: [{ value: "Todos", label: "Todos" }, ...tipos.map((t) => ({ value: t, label: t }))] },
    { key: "ciudad", label: "Ubicación", options: [{ value: "Todas", label: "Todas" }, ...ciudades.map((c) => ({ value: c, label: c }))] },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4">
      {/* Búsqueda */}
      <div className="w-130 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a0]" size={16} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por alerta, activo o responsable..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
          />
        </div>
      </div>

      {/* Selects */}
      {selects.map(({ key, label, options }) => (
        <div key={key} className="flex-1 min-w-[140px] flex flex-col gap-1">
          <label className="text-xs font-medium text-[#686971]">{label}</label>
          <div className="relative">
            <select
              value={filters[key] as string}
              onChange={(e) => set(key, e.target.value as AlertsFilters[typeof key])}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" size={14} />
          </div>
        </div>
      ))}

      {/* Botón limpiar */}
      <button
        onClick={() => onChange(DEFAULT_ALERTS_FILTERS)}
        className="flex-shrink-0 border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal size={15} />
        Limpiar filtros
      </button>
    </div>
  );
}
