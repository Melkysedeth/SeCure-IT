import { useState } from "react";
import { Bell } from "lucide-react";
import AlertsKPICards from "../components/alerts/AlertsKPICards";
import AlertsFilterBar, { DEFAULT_ALERTS_FILTERS, type AlertsFilters } from "../components/alerts/AlertsFilterBar";
import AlertsFullTable from "../components/alerts/AlertsFullTable";

export default function Alertas() {
  const [filters, setFilters] = useState<AlertsFilters>(DEFAULT_ALERTS_FILTERS);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#519d99]/10 p-2 rounded-lg">
            <Bell className="text-[#519d99]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3d3d42]">Alertas</h1>
            <p className="text-sm text-[#9898a0]">Monitorea y gestiona las alertas generadas por los activos.</p>
          </div>
        </div>
      </div>

      <AlertsKPICards
        filters={filters}
        onCardClick={(filterKey, value) =>
          setFilters((f) => ({
            ...DEFAULT_ALERTS_FILTERS,
            search: f.search,
            [filterKey]: value,
          }))
        }
      />
      <AlertsFilterBar filters={filters} onChange={setFilters} />
      <AlertsFullTable filters={filters} />
    </div>
  );
}
