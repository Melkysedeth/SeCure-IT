import KPICards from "../components/dashboard/KPICards";
import AssetsTable from "../components/dashboard/AssetsTable";
import ColombiaMap from "../components/map/ColombiaMap";
import { ActividadReciente, AlertasRecientes } from "../components/dashboard/RecentActivity";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <KPICards />
      <div className="grid grid-cols-3 gap-6 items-start">
        <ColombiaMap />
        <ActividadReciente />
        <AlertasRecientes />
      </div>
      <AssetsTable />
    </div>
  );
}
