import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

const filterSelects = [
  { label: "Estado", options: ["Todos"] },
  { label: "Ubicación", options: ["Todas"] },
  { label: "Usuario", options: ["Todos"] },
  { label: "Departamento", options: ["Todos"] },
];

export default function AssetsFilterBar() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4">
      {/* Búsqueda */}
      <div className="w-140 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a0]" size={16} />
          <input
            type="text"
            placeholder="Buscar activo..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
          />
        </div>
      </div>

      {/* Selects */}
      {filterSelects.map(({ label, options }) => (
        <div key={label} className="flex-1 min-w-[140px] flex flex-col gap-1">
          <label className="text-xs font-medium text-[#686971]">{label}</label>
          <div className="relative">
            <select className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99] cursor-pointer">
              {options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9898a0] pointer-events-none" size={14} />
          </div>
        </div>
      ))}

      {/* Botón filtros */}
      <button className="flex-shrink-0 border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
        <SlidersHorizontal size={15} />
        Filtros
      </button>
    </div>
  );
}
