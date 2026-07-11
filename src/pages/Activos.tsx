import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Monitor, Plus, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAssets } from "../hooks/useAssets";
import { useSedes } from "../hooks/useSedes";
import KPICards from "../components/dashboard/KPICards";
import AssetsFilterBar, { type AssetsFilters } from "../components/assets/AssetsFilterBar";
import AssetsFullTable, { mapActivo, applyAssetsFilters, estadoBadge } from "../components/assets/AssetsFullTable";
import RegisterAssetModal from "../components/assets/RegisterAssetModal";
import { exportRowsToExcel } from "../lib/exportExcel";
import { actualizarActivo } from "../lib/assets";
import type { NuevoActivoForm } from "../types";

export default function Activos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: activosRaw, refetch } = useAssets();
  const { data: sedes } = useSedes();

  const editTarget = editId ? activosRaw.find((a: any) => a.id === editId) ?? null : null;
  const editFormData: NuevoActivoForm | null = editTarget
    ? {
        codigo: editTarget.codigo,
        nombre_equipo: editTarget.nombre_equipo ?? "",
        tipo: editTarget.tipo ?? "",
        serial: editTarget.serial ?? "",
        marca: editTarget.marca ?? "",
        modelo: editTarget.modelo ?? "",
        sistema_op: editTarget.sistema_op ?? "",
        version_so: editTarget.version_so ?? "",
        dominio: editTarget.dominio ?? "",
        nombre_responsable: editTarget.nombre_responsable ?? "",
        tipo_documento: editTarget.tipo_documento ?? "",
        numero_documento: editTarget.numero_documento ?? "",
        departamento: editTarget.departamento ?? "",
        sede_id: editTarget.sede_id ?? "",
        observaciones: editTarget.observaciones ?? "",
        procesador: editTarget.procesador ?? "",
        memoria_ram: editTarget.memoria_ram ?? "",
        almacenamiento: editTarget.almacenamiento ?? "",
        direccion_mac: editTarget.direccion_mac ?? "",
      }
    : null;

  function handleEdit(id: string) {
    setEditId(id);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditId(null);
  }

  // Si se llega desde el Dashboard (click en una KPI card), la URL trae
  // ?estado=en_linea|fuera_sede|sin_conexion|Todos. Lo usamos para
  // inicializar el filtro de estado apenas se monta la página.
  const [searchParams] = useSearchParams();
  const estadoInicial = (searchParams.get("estado") as AssetsFilters["estado"] | null) ?? "Todos";

  const [filters, setFilters] = useState<AssetsFilters>({
    search: "",
    estado: estadoInicial,
    ubicacion: "Todas",
    usuario: "Todos",
    departamento: "Todos",
  });

  function handleExport() {
    // Exporta exactamente lo que se ve en pantalla: mismos filtros, mismo orden.
    const mapped = activosRaw.map(mapActivo);
    const filtered = applyAssetsFilters(mapped, filters);

    const rows = filtered.map((a) => ({
      Código: a.codigo,
      Nombre: a.nombre,
      Usuario: a.usuario,
      Departamento: a.cargo,
      Ubicación: a.ubicacion,
      Sede: a.sede,
      Estado: estadoBadge[a.estado].label,
      "Batería (%)": a.bateria ?? "N/A",
      "Última conexión": a.ultima_conexion,
      "N° Documento": a.numero_documento,
    }));

    const fecha = new Date().toISOString().slice(0, 10);
    exportRowsToExcel(rows, `activos_${fecha}.xlsx`, "Activos");
  }

  async function handleSave(data: NuevoActivoForm) {
    if (editId) {
      await actualizarActivo(editId, data);
      refetch();
      handleCloseModal();
      return;
    }

    // Generamos el id en el cliente para no depender de un SELECT de vuelta
    // después del INSERT (eso requeriría permiso de SELECT vía RLS sobre la
    // fila recién creada, que es una condición distinta a la de INSERT).
    const activoId = crypto.randomUUID();

    // 1) Crear el activo en la tabla base.
    const { error: activoError } = await supabase.from("activos").insert({
      id: activoId,
      codigo: data.codigo,
      nombre_equipo: data.nombre_equipo,
      tipo: data.tipo,
      serial: data.serial || null,
      marca: data.marca,
      modelo: data.modelo,
      procesador: data.procesador || null,
      memoria_ram: data.memoria_ram || null,
      almacenamiento: data.almacenamiento || null,
      direccion_mac: data.direccion_mac || null,
      sistema_op: data.sistema_op || null,
      version_so: data.version_so || null,
      dominio: data.dominio || null,
      tipo_documento: data.tipo_documento,
      numero_documento: data.numero_documento,
      nombre_responsable: data.nombre_responsable,
      departamento: data.departamento,
      sede_id: data.sede_id,
      observaciones: data.observaciones || null,
    });

    if (activoError) {
      throw new Error(activoError.message);
    }

    // 2) Sembrar el primer reporte para que el activo aparezca de inmediato
    //    con estado real en `activos_con_reporte`, en vez de quedar en blanco
    //    hasta que el agente mande su primer reporte. Se usa la sede recién
    //    asignada como punto de referencia (mismas coordenadas, estado
    //    "en_linea") — no lleva bssid_conectado, así que el trigger de
    //    geofencing no lo toca y respeta este estado inicial.
    const sede = sedes.find((s) => s.id === data.sede_id);
    const { error: reporteError } = await supabase.from("reportes").insert({
      activo_id: activoId,
      estado: "en_linea",
      ubicacion_ciudad: sede?.ciudad ?? null,
      latitud: sede?.latitud ?? null,
      longitud: sede?.longitud ?? null,
    });

    if (reporteError) {
      throw new Error(`El activo se registró, pero falló el reporte inicial: ${reporteError.message}`);
    }

    // Refresca la tabla al instante sin esperar el ciclo normal de cache.
    refetch();
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
          <button onClick={handleExport} className="border border-gray-200 text-[#686971] text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <KPICards estadoActivo={filters.estado} onCardClick={(estado) => setFilters((f) => ({ ...f, estado: estado as AssetsFilters["estado"] }))} />
      <AssetsFilterBar filters={filters} onChange={setFilters} />
      <AssetsFullTable filters={filters} onEdit={handleEdit} />

      <RegisterAssetModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={editFormData} />
    </div>
  );
}
