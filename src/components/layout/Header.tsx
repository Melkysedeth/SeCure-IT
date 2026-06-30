import { useLocation } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/activos": "Activos",
  "/mapa": "Mapa",
  "/alertas": "Alertas",
  "/historial": "Historial",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/usuarios": "Usuarios",
};

export default function Header() {
  const location = useLocation();
  const title = titles[location.pathname] || "SeCure-IT";

  return (
    <header className="h-15 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Contenedor para el icono y el título juntos */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Corrección del error tipográfico: hover:text-gray-700 */}
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">8</span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#519d99] flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="text-sm text-[#4a4a52]">Administrador</span>
          <ChevronDown size={16} className="text-[#519d99]" />
        </div>
      </div>
    </header>
  );
}
