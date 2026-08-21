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
  leftBorder: string;
  waveColor: string;
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
    {
      label: "Total Activos",
      sublabel: "Todos los equipos",
      value: total,
      icon: Monitor,
      iconBg: "bg-[#519d99]/10",
      iconColor: "text-[#519d99]",
      leftBorder: "border-l-[#519d99]",
      waveColor: "text-[#519d99]",
      filterValue: "Todos",
    },
    {
      label: "En línea",
      sublabel: `${pct}% del total`,
      value: enLinea,
      icon: Wifi,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      leftBorder: "border-l-green-500",
      waveColor: "text-green-500",
      filterValue: "en_linea",
    },
    {
      label: "Fuera de sede",
      sublabel: "Requieren atención",
      value: fueraDeSede,
      icon: MapPin,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      leftBorder: "border-l-orange-400",
      waveColor: "text-orange-400",
      filterValue: "fuera_sede",
    },
    {
      label: "Sin conexión",
      sublabel: "> 24 horas sin reporte",
      value: sinConexion,
      icon: WifiOff,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      leftBorder: "border-l-red-400",
      waveColor: "text-red-400",
      filterValue: "sin_conexion",
    },
    {
      label: "Alertas activas",
      sublabel: alertasActivas > 0 ? "Requieren atención" : "Todo en orden",
      value: alertasActivas,
      icon: Bell,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      leftBorder: "border-l-amber-400",
      waveColor: "text-amber-400",
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
          <div key={n} className="bg-white rounded-2xl p-6 h-36 shadow-md border border-gray-100 animate-pulse" />
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
        const { label, sublabel, value, icon: Icon, iconBg, iconColor, leftBorder, waveColor, filterValue, href } = card;
        const isClickable = Boolean(filterValue || href);
        const isActive = Boolean(filterValue && estadoActivo === filterValue);
        const gradientId = `wave-${label.replace(/\s+/g, "-").toLowerCase()}`;
        return (
          <div
            key={label}
            onClick={() => handleClick(card)}
            className={`relative overflow-hidden bg-white rounded-2xl pl-6 pr-5 pt-6 pb-4 flex flex-col gap-2 shadow-md shadow-slate-900/10 border-y border-r ${leftBorder} border-l-[3px] transition-all ${isClickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/15" : ""
              } ${isActive ? "border-y-[#519d99] border-r-[#519d99] ring-2 ring-[#519d99]/25" : "border-y-gray-100 border-r-gray-100"}`}
          >
            <div className="flex items-center gap-4">
              {/* Icono en círculo claro */}
              <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-full ${iconBg}`}>
                <Icon size={24} className={iconColor} />
              </div>

              <div className="min-w-0">
                <p className="text-3xl leading-tight font-bold text-slate-800">{value}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
                <p className="text-xs text-slate-400">{sublabel}</p>
              </div>
            </div>

            {/* Línea de datos irregular, ascendente, sutil */}
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" className={`w-full h-6 ${waveColor}`}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M12,31 L24,27 L34,30 L46,21 L57,24 L68,14 L80,18 L92,9 L104,13 L116,7 L128,11 L140,5 L152,9 L164,4 L176,8 L188,3 L188,40 L12,40 Z"
                fill={`url(#${gradientId})`}
              />
              <path
                d="M12,31 L24,27 L34,30 L46,21 L57,24 L68,14 L80,18 L92,9 L104,13 L116,7 L128,11 L140,5 L152,9 L164,4 L176,8 L188,3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}