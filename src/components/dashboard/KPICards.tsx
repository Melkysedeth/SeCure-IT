import { Monitor, Wifi, MapPin, WifiOff, HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";
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

function buildCards(data: ReturnType<typeof useAssets>["data"]): CardDef[] {
  const total = data.length;
  const enLinea = data.filter((a: any) => a.estado === "en_linea").length;
  const fueraDeSede = data.filter((a: any) => a.estado === "fuera_sede").length;
  const sinConexion = data.filter((a: any) => a.estado === "sin_conexion").length;
  const nuncaReportado = data.filter((a: any) => a.estado === "nunca_reportado").length;
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
      label: "Nunca reportado",
      sublabel: "Agente no instalado",
      value: nuncaReportado,
      icon: HelpCircle,
      iconBg: "bg-slate-200",
      iconColor: "text-slate-500",
      leftBorder: "border-l-slate-400",
      waveColor: "text-slate-400",
      filterValue: "nunca_reportado",
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
  const navigate = useNavigate();

  const cards = useMemo(() => buildCards(data), [data]);

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
        const { label, sublabel, value, icon: Icon, iconBg, iconColor, leftBorder, filterValue, href } = card;
        const isClickable = Boolean(filterValue || href);
        const isActive = Boolean(filterValue && estadoActivo === filterValue);
        return (
          <div
            key={label}
            onClick={() => handleClick(card)}
            className={`relative overflow-hidden bg-white rounded-2xl pl-6 pr-5 pt-6 pb-4 flex flex-col gap-2 shadow-md shadow-slate-900/10 border-y border-r ${leftBorder} border-l-[3px] transition-all ${isClickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/15" : ""
              } ${isActive ? "border-y-[#519d99] border-r-[#519d99] ring-2 ring-[#519d99]/25" : "border-y-gray-100 border-r-gray-100"}`}
          >
            <div className="flex items-center gap-4">
              <div className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-full ${iconBg}`}>
                <Icon size={30} className={iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-3xl leading-tight font-bold text-slate-800">{value}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
                <p className="text-xs text-slate-400">{sublabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}