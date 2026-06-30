import { Monitor, Wifi, MapPin, WifiOff, Bell } from "lucide-react";

const cards = [
  {
    label: "Total Activos",
    sublabel: "Todos los equipos",
    value: 153,
    icon: Monitor,
    iconBg: "bg-[#519d99]/10",
    iconColor: "text-[#519d99]",
  },
  {
    label: "En línea",
    sublabel: "78.4% del total",
    value: 120,
    icon: Wifi,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Fuera de sede",
    sublabel: "Requieren atención",
    value: 4,
    icon: MapPin,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Sin conexión",
    sublabel: "> 7 días sin reporte",
    value: 29,
    icon: WifiOff,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    label: "Alertas activas",
    sublabel: "Requieren atención",
    value: 8,
    icon: Bell,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map(({ label, sublabel, value, icon: Icon, iconBg, iconColor }) => (
        <div key={label} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className={`${iconBg} p-3 rounded-lg`}>
            <Icon size={20} className={iconColor} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3d3d42]">{value}</p>
            <p className="text-xs font-medium text-[#3d3d42]">{label}</p>
            <p className="text-[11px] text-[#9898a0]">{sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
