import { Bell, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAlerts } from "../../hooks/useAlerts";
import { mapAlerta } from "../../lib/alerts";

interface KPICard {
  label: string;
  sublabel: string;
  value: number;
  icon: typeof Bell;
  iconBg: string;
  iconColor: string;
  filterKey: "estado" | "severidad";
  filterValue: string;
}

function buildCards(raw: ReturnType<typeof useAlerts>["data"]): KPICard[] {
  const data = raw.map(mapAlerta);
  const total = data.length;
  const activas = data.filter((a) => a.estado === "Activa").length;
  const criticas = data.filter((a) => a.severidad === "critica").length;
  const altas = data.filter((a) => a.severidad === "alta").length;
  const resueltas = data.filter((a) => a.estado === "Resuelta").length;

  return [
    { label: "Total alertas", sublabel: "Todas las alertas", value: total, icon: Bell, iconBg: "bg-[#519d99]/10", iconColor: "text-[#519d99]", filterKey: "estado", filterValue: "Todos" },
    { label: "Activas", sublabel: "Pendientes por atender", value: activas, icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-500", filterKey: "estado", filterValue: "Activa" },
    {
      label: "Sin Conexión",
      sublabel: "Atención inmediata",
      value: criticas,
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      filterKey: "severidad",
      filterValue: "critica",
    },
    { label: "Fuera de Sede", sublabel: "Alta prioridad", value: altas, icon: AlertTriangle, iconBg: "bg-amber-100", iconColor: "text-amber-600", filterKey: "severidad", filterValue: "alta" },
    { label: "Resueltas", sublabel: "Ya atendidas", value: resueltas, icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600", filterKey: "estado", filterValue: "Resuelta" },
  ];
}

export default function AlertsKPICards({
  filters,
  onCardClick,
}: {
  filters?: { estado: string; severidad: string };
  onCardClick?: (filterKey: "estado" | "severidad", value: string) => void;
} = {}) {
  const { data, loading } = useAlerts();
  const cards = useMemo(() => buildCards(data), [data]);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white rounded-xl p-4 h-20 shadow-sm border border-gray-100 animate-pulse" />
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
      {cards.map(({ label, sublabel, value, icon: Icon, iconBg, iconColor, filterKey, filterValue }) => {
        const isActive = filters?.[filterKey] === filterValue;
        return (
          <div
            key={label}
            onClick={() => handleClick(filterKey, filterValue)}
            className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border cursor-pointer transition-colors hover:border-[#519d99]/40 ${
              isActive ? "border-[#519d99] ring-1 ring-[#519d99]/30" : "border-gray-100"
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
