import { Eye, MapPin, MoreHorizontal } from "lucide-react";

type Estado = "en_linea" | "sin_conexion" | "fuera_sede";

interface Activo {
  codigo: string;
  nombre: string;
  usuario: string;
  ubicacion: string;
  estado: Estado;
  bateria: number;
  ultima_conexion: string;
}

const estadoBadge: Record<Estado, { label: string; className: string }> = {
  en_linea: { label: "En línea", className: "bg-green-100 text-green-700" },
  sin_conexion: { label: "Sin conexión", className: "bg-red-100 text-red-600" },
  fuera_sede: { label: "Fuera de sede", className: "bg-orange-100 text-orange-600" },
};

const mockData: Activo[] = [
  { codigo: "P155", nombre: "HP EliteBook 840", usuario: "juan.perez", ubicacion: "Barranquilla", estado: "en_linea", bateria: 82, ultima_conexion: "Hace 2 min" },
  { codigo: "P098", nombre: "Lenovo ThinkPad L14", usuario: "maria.gomez", ubicacion: "Bogotá", estado: "en_linea", bateria: 65, ultima_conexion: "Hace 15 min" },
  { codigo: "P120", nombre: "Dell Latitude 5420", usuario: "administrador", ubicacion: "Bogotá", estado: "en_linea", bateria: 34, ultima_conexion: "Hace 35 min" },
  { codigo: "P073", nombre: "Asus VivoBook 15", usuario: "sin usuario", ubicacion: "—", estado: "sin_conexion", bateria: 0, ultima_conexion: "Hace 8 días" },
  { codigo: "P131", nombre: "HP ProBook 450", usuario: "camila.rojas", ubicacion: "Montería", estado: "en_linea", bateria: 91, ultima_conexion: "Hace 3 horas" },
];

function BateriaBar({ value }: { value: number }) {
  const color = value > 50 ? "bg-green-500" : value > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[#686971] whitespace-nowrap">{value}%</span>
    </div>
  );
}

export default function AssetsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Activos recientes</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todos los activos →</button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[11px] text-[#9898a0] uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-3 text-left">Código</th>
              <th className="px-5 py-3 text-left">Nombre</th>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Ubicación</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Batería</th>
              <th className="px-5 py-3 text-left">Última conexión</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((activo) => {
              const badge = estadoBadge[activo.estado];
              return (
                <tr key={activo.codigo} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#3d3d42] font-medium">{activo.codigo}</td>
                  <td className="px-5 py-3 text-[#3d3d42] font-medium">{activo.nombre}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.usuario}</td>
                  <td className="px-5 py-3 text-[#686971]">{activo.ubicacion}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-5 py-3">{activo.bateria > 0 ? <BateriaBar value={activo.bateria} /> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-5 py-3 text-[#686971] text-xs">{activo.ultima_conexion}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-[#9898a0]">
                      <button className="hover:text-[#519d99] transition-colors">
                        <Eye size={15} />
                      </button>
                      <button className="hover:text-[#519d99] transition-colors">
                        <MapPin size={15} />
                      </button>
                      <button className="hover:text-[#519d99] transition-colors">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
