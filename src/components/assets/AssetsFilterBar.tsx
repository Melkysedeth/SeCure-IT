import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

export interface AssetsFilters {
  search: string;
  estado: string;
  ubicacion: string;
  usuario: string;
  departamento: string;
}

interface Props {
  filters: AssetsFilters;
  onChange: (filters: AssetsFilters) => void;
}

const estadoOptions = [
  { value: "Todos", label: "Todos" },
  { value: "en_linea", label: "En línea" },
  { value: "sin_conexion", label: "Sin conexión" },
  { value: "fuera_sede", label: "Fuera de sede" },
];

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  const set = new Set(values.filter((v): v is string => !!v && v.trim() !== ""));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function AssetsFilterBar({ filters, onChange }: Props) {
  const { data } = useAssets();

  const ubicaciones = useMemo(() => uniqueSorted(data.map((a: any) => a.ubicacion_ciudad ?? a.ciudad_asignada)), [data]);
  const usuarios = useMemo(() => uniqueSorted(data.map((a: any) => a.nombre_responsable ?? a.usuario_activo)), [data]);
  const departamentos = useMemo(() => uniqueSorted(data.map((a: any) => a.departamento)), [data]);

  function set<K extends keyof AssetsFilters>(key: K, value: AssetsFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const selects: { key: keyof AssetsFilters; label: string; options: { value: string; label: string }[] }[] = [
    { key: "estado", label: "Estado", options: estadoOptions },
    { key: "ubicacion", label: "Ubicación", options: [{ value: "Todas", label: "Todas" }, ...ubicaciones.map((u) => ({ value: u, label: u }))] },
    { key: "usuario", label: "Usuario", options: [{ value: "Todos", label: "Todos" }, ...usuarios.map((u) => ({ value: u, label: u }))] },
    { key: "departamento", label: "Departamento", options: [{ value: "Todos", label: "Todos" }, ...departamentos.map((d) => ({ value: d, label: d }))] },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4">
      {/* Búsqueda */}
      <div className="w-140 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a0]" size={16} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por código, nombre, usuario o documento..."
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
              value={filters[key]}
              onChange={(e) => set(key, e.target.value)}
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
        onClick={() => onChange({ search: "", estado: "Todos", ubicacion: "Todas", usuario: "Todos", departamento: "Todos" })}
        className="flex-shrink-0 border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal size={15} />
        Limpiar filtros
      </button>
    </div>
  );
}
