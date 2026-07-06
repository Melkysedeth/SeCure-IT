import { Monitor, Wifi, MapPin, WifiOff, Bell } from "lucide-react";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useAlerts } from "../../hooks/useAlerts";
import { mapAlerta } from "../../lib/alerts";
import { useNavigate } from "react-router-dom";

interface CardDef {
  label: string;
  sublabel: string;
  value: number;
  icon: typeof Monitor;
  iconBg: string;
  iconColor: string;
  filterValue: string | null;
  href?: string;
}

function buildCards(data: ReturnType<typeof useAssets>["data"], alertasActivas: number): CardDef[] {
  const total = data.length;
  const enLinea = data.filter((a: any) => a.estado === "en_linea").length;
  const fueraDeSede = data.filter((a: any) => a.estado === "fuera_sede").length;
  const sinConexion = data.filter((a: any) => a.estado === "sin_conexion").length;
  const pct = total > 0 ? ((enLinea / total) * 100).toFixed(1) : "0";

  return [
    { label: "Total Activos", sublabel: "Todos los equipos", value: total, icon: Monitor, iconBg: "bg-[#519d99]/10", iconColor: "text-[#519d99]", filterValue: "Todos" },
    { label: "En línea", sublabel: `${pct}% del total`, value: enLinea, icon: Wifi, iconBg: "bg-green-100", iconColor: "text-green-600", filterValue: "en_linea" },
    { label: "Fuera de sede", sublabel: "Requieren atención", value: fueraDeSede, icon: MapPin, iconBg: "bg-orange-100", iconColor: "text-orange-500", filterValue: "fuera_sede" },
    { label: "Sin conexión", sublabel: "> 7 días sin reporte", value: sinConexion, icon: WifiOff, iconBg: "bg-red-100", iconColor: "text-red-500", filterValue: "sin_conexion" },
    {
      label: "Alertas activas",
      sublabel: alertasActivas > 0 ? "Requieren atención" : "Todo en orden",
      value: alertasActivas,
      icon: Bell,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      filterValue: null,
      href: "/alertas",
    },
  ];
}

export default function KPICards({
  estadoActivo,
  onCardClick,
}: {
  estadoActivo?: string;
  onCardClick?: (estado: string) => void;
} = {}) {
  const { data, loading } = useAssets();
  const { data: alertas } = useAlerts();
  const navigate = useNavigate();

  const alertasActivas = useMemo(() => alertas.filter((raw) => mapAlerta(raw).estado === "Activa").length, [alertas]);
  const cards = useMemo(() => buildCards(data, alertasActivas), [data, alertasActivas]);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white rounded-xl p-4 h-20 shadow-sm border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  function handleClick(card: CardDef) {
    if (card.href) {
      navigate(card.href);
      return;
    }
    if (!card.filterValue) return;
    if (onCardClick) {
      onCardClick(card.filterValue);
    } else {
      navigate(`/activos?estado=${card.filterValue}`);
    }
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => {
        const { label, sublabel, value, icon: Icon, iconBg, iconColor, filterValue, href } = card;
        const isClickable = Boolean(filterValue || href);
        return (
          <div
            key={label}
            onClick={() => handleClick(card)}
            className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border transition-colors ${isClickable ? "cursor-pointer hover:border-[#519d99]/40" : ""} ${
              filterValue && estadoActivo === filterValue ? "border-[#519d99] ring-1 ring-[#519d99]/30" : "border-gray-100"
            }`}
          >
            <div className={`${iconBg} p-3 rounded-lg`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#3d3d42]">{value}</p>
              <p className="text-xs font-medium text-[#3d3d42]">{label}</p>
              <p className="text-[11px] text-[#9898a0]">{sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
