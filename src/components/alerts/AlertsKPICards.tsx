import { Bell, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAlertsKPIs, type AlertsKPIData } from "../../hooks/useAlertsKPIs";

interface KPICard {
  label: string;
  sublabel: string;
  value: number;
  icon: typeof Bell;
  iconBg: string;
  iconColor: string;
  leftBorder: string;
  waveColor: string;
  filterKey: "estado" | "severidad";
  filterValue: string;
}

function buildCards({ total, activas, criticas, altas, resueltas }: AlertsKPIData): KPICard[] {
  return [
    {
      label: "Total alertas",
      sublabel: "Todas las alertas",
      value: total,
      icon: Bell,
      iconBg: "bg-[#519d99]/10",
      iconColor: "text-[#519d99]",
      leftBorder: "border-l-[#519d99]",
      waveColor: "text-[#519d99]",
      filterKey: "estado",
      filterValue: "Todos",
    },
    {
      label: "Activas",
      sublabel: "Pendientes por atender",
      value: activas,
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      leftBorder: "border-l-red-400",
      waveColor: "text-red-400",
      filterKey: "estado",
      filterValue: "Activa",
    },
    {
      label: "Sin Conexión",
      sublabel: "Atención inmediata",
      value: criticas,
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      leftBorder: "border-l-orange-400",
      waveColor: "text-orange-400",
      filterKey: "severidad",
      filterValue: "critica",
    },
    {
      label: "Fuera de Sede",
      sublabel: "Alta prioridad",
      value: altas,
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      leftBorder: "border-l-amber-400",
      waveColor: "text-amber-400",
      filterKey: "severidad",
      filterValue: "alta",
    },
    {
      label: "Resueltas",
      sublabel: "Ya atendidas",
      value: resueltas,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      leftBorder: "border-l-green-500",
      waveColor: "text-green-500",
      filterKey: "estado",
      filterValue: "Resuelta",
    },
  ];
}

export default function AlertsKPICards({
  filters,
  onCardClick,
}: {
  filters?: { estado: string; severidad: string };
  onCardClick?: (filterKey: "estado" | "severidad", value: string) => void;
} = {}) {
  const { data, loading } = useAlertsKPIs();
  const cards = useMemo(() => buildCards(data), [data]);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white rounded-2xl p-6 h-36 shadow-md border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  function handleClick(filterKey: "estado" | "severidad", filterValue: string) {
    if (onCardClick) {
      onCardClick(filterKey, filterValue);
    } else {
      navigate(`/alertas?${filterKey}=${filterValue}`);
    }
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map(({ label, sublabel, value, icon: Icon, iconBg, iconColor, leftBorder, filterKey, filterValue }) => {
        const isActive = filters?.[filterKey] === filterValue;
        return (
          <div
            key={label}
            onClick={() => handleClick(filterKey, filterValue)}
            className={`relative overflow-hidden bg-white rounded-2xl pl-6 pr-5 pt-6 pb-4 flex flex-col gap-2 shadow-md shadow-slate-900/10 border-y border-r ${leftBorder} border-l-[3px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/15 ${isActive ? "border-y-[#519d99] border-r-[#519d99] ring-2 ring-[#519d99]/25" : "border-y-gray-100 border-r-gray-100"
              }`}
          >
            <div className="flex items-center gap-4">
              {/* Icono en círculo claro */}
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