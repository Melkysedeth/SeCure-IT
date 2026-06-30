import { Monitor, Wifi, AlertTriangle, MapPin } from "lucide-react";

interface Actividad {
  tipo: "conexion" | "ubicacion" | "usuario";
  codigo: string;
  nombre: string;
  detalle: string;
  tiempo: string;
}

const actividades: Actividad[] = [
  { tipo: "conexion", codigo: "P155", nombre: "HP EliteBook 840", detalle: "Conexión desde Barranquilla", tiempo: "Hace 2 minutos" },
  { tipo: "ubicacion", codigo: "P098", nombre: "Lenovo ThinkPad L14", detalle: "Cambio de ubicación a Bogotá", tiempo: "Hace 15 minutos" },
  { tipo: "usuario", codigo: "P120", nombre: "Dell Latitude 5420", detalle: "Usuario diferente detectado", tiempo: "Hace 35 minutos" },
];

const iconMap = {
  conexion: { icon: Wifi, className: "bg-green-100 text-green-600" },
  ubicacion: { icon: MapPin, className: "bg-blue-100 text-blue-600" },
  usuario: { icon: Monitor, className: "bg-orange-100 text-orange-600" },
};

interface Alerta {
  codigo: string;
  nombre: string;
  detalle: string;
  tiempo: string;
  severidad: "alta" | "media";
}

const alertas: Alerta[] = [
  { codigo: "P155", nombre: "Equipo fuera de sede", detalle: "Barranquilla → Bogotá", tiempo: "Hace 15 min", severidad: "alta" },
  { codigo: "P073", nombre: "Sin conexión", detalle: "Sin reporte hace 8 días", tiempo: "Hace 2 horas", severidad: "alta" },
  { codigo: "P120", nombre: "Cambio de usuario", detalle: "De jorge a administrador", tiempo: "Hace 2 horas", severidad: "media" },
  { codigo: "P098", nombre: "Batería baja", detalle: "12% al último reporte", tiempo: "Hace 3 horas", severidad: "media" },
];

export function ActividadReciente() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Actividad reciente</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todas</button>
      </div>
      <div className="flex flex-col">
        {actividades.map((act, i) => {
          const { icon: Icon, className } = iconMap[act.tipo];
          return (
            <div key={i} className="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className={`${className} p-2 rounded-lg h-fit`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#3d3d42] truncate">
                  {act.codigo} - {act.nombre}
                </p>
                <p className="text-[11px] text-[#9898a0]">{act.detalle}</p>
                <p className="text-[10px] text-[#9898a0] mt-0.5">{act.tiempo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AlertasRecientes() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Alertas recientes</h2>
        <button className="text-xs text-[#519d99] font-medium hover:underline">Ver todas</button>
      </div>
      <div className="flex flex-col">
        {alertas.map((alerta, i) => (
          <div key={i} className="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
            <div className={`p-2 rounded-lg h-fit ${alerta.severidad === "alta" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>
              <AlertTriangle size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#3d3d42] truncate">
                {alerta.codigo} - {alerta.nombre}
              </p>
              <p className="text-[11px] text-[#9898a0]">{alerta.detalle}</p>
              <p className="text-[10px] text-[#9898a0] mt-0.5">{alerta.tiempo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
