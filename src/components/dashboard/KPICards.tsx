import { Monitor, Wifi, MapPin, WifiOff, Bell } from "lucide-react";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

function buildCards(data: ReturnType<typeof useAssets>["data"]) {
  const total = data.length;
  const enLinea = data.filter((a: any) => a.estado === "en_linea").length;
  const fueraDeSede = data.filter((a: any) => a.estado === "fuera_sede").length;
  const sinConexion = data.filter((a: any) => a.estado === "sin_conexion").length;
  const pct = total > 0 ? ((enLinea / total) * 100).toFixed(1) : "0";

  return [
    { label: "Total Activos", sublabel: "Todos los equipos", value: total, icon: Monitor, iconBg: "bg-[#519d99]/10", iconColor: "text-[#519d99]" },
    { label: "En línea", sublabel: `${pct}% del total`, value: enLinea, icon: Wifi, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Fuera de sede", sublabel: "Requieren atención", value: fueraDeSede, icon: MapPin, iconBg: "bg-orange-100", iconColor: "text-orange-500" },
    { label: "Sin conexión", sublabel: "> 7 días sin reporte", value: sinConexion, icon: WifiOff, iconBg: "bg-red-100", iconColor: "text-red-500" },
    { label: "Alertas activas", sublabel: "Próximamente", value: 0, icon: Bell, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  ];
}

export default function KPICards() {
  const { data, loading } = useAssets();
  const cards = useMemo(() => buildCards(data), [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white rounded-xl p-4 h-20 shadow-sm border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

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
