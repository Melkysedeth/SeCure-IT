import { useState } from "react";
import { Monitor, Plus, Download } from "lucide-react";
import KPICards from "../components/dashboard/KPICards";
import AssetsFilterBar, { type AssetsFilters } from "../components/assets/AssetsFilterBar";
import AssetsFullTable from "../components/assets/AssetsFullTable";
import RegisterAssetModal from "../components/assets/RegisterAssetModal";
import type { NuevoActivoForm } from "../types";

export default function Activos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<AssetsFilters>({
    search: "",
    estado: "Todos",
    ubicacion: "Todas",
    usuario: "Todos",
    departamento: "Todos",
  });

  function handleSave(data: NuevoActivoForm) {
    console.log("Nuevo activo:", data); // luego: insertar en Supabase
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#519d99]/10 p-2 rounded-lg">
            <Monitor className="text-[#519d99]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3d3d42]">Activos</h1>
            <p className="text-sm text-[#9898a0]">Administra y monitorea todos los activos tecnológicos de la empresa.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalOpen(true)} className="bg-[#519d99] hover:bg-[#3d7a76] text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Registrar activo
          </button>
          <button className="border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <KPICards />
      <AssetsFilterBar filters={filters} onChange={setFilters} />
      <AssetsFullTable filters={filters} />

      <RegisterAssetModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
