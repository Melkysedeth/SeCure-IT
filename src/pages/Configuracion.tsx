import { useState } from "react";
import { Building2, Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { useSedes } from "../hooks/useSedes";
import { crearSede, actualizarSede, eliminarSede, fetchBssidsDeSede, type NuevaSedeForm } from "../lib/sedes";
import AddSedeModal, { type FormState } from "../components/settings/AddSedeModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import type { Sede } from "../types";

export default function Configuracion() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<FormState | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Sede | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: sedes, refetch } = useSedes();

  async function handleEdit(sede: Sede) {
    const bssids = await fetchBssidsDeSede(sede.id);
    setEditId(sede.id);
    setEditData({
      nombre: sede.nombre,
      ciudad: sede.ciudad,
      direccion: sede.direccion ?? "",
      latitud: String(sede.latitud),
      longitud: String(sede.longitud),
      bssids: bssids.length > 0 ? bssids : [""],
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditId(null);
    setEditData(null);
  }

  async function handleSave(data: NuevaSedeForm) {
    if (editId) {
      await actualizarSede(editId, data);
    } else {
      await crearSede(data);
    }
    refetch();
    handleCloseModal();
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await eliminarSede(confirmTarget.id);
      refetch();
      setConfirmTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar la sede.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#519d99]/10 p-2 rounded-lg">
            <Building2 className="text-[#519d99]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#3d3d42]">Sedes</h1>
            <p className="text-sm text-[#9898a0]">Gestiona las sedes de la empresa y sus coordenadas para el geofencing de activos.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setEditData(null);
            setModalOpen(true);
          }}
          className="bg-[#519d99] hover:bg-[#3d7a76] text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Agregar sede
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {sedes.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#9898a0]">Todavía no hay sedes registradas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#686971] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium">Ciudad</th>
                <th className="text-left px-6 py-3 font-medium">Dirección</th>
                <th className="text-left px-6 py-3 font-medium">Coordenadas</th>
                <th className="text-left px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sedes.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-medium text-[#3d3d42]">{s.nombre}</td>
                  <td className="px-6 py-3 text-[#686971]">{s.ciudad}</td>
                  <td className="px-6 py-3 text-[#686971]">{s.direccion ?? "—"}</td>
                  <td className="px-6 py-3 text-[#686971]">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-[#519d99]" />
                      {s.latitud.toFixed(5)}, {s.longitud.toFixed(5)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3 text-[#9898a0]">
                      <button onClick={() => handleEdit(s)} className="hover:text-[#519d99] transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmTarget(s);
                          setDeleteError(null);
                        }}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddSedeModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={editData} />

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Eliminar sede"
        message={confirmTarget ? `Esta acción eliminará permanentemente la sede "${confirmTarget.nombre}" y sus redes asociadas. No se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
