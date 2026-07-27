import { useState } from "react";
import { X } from "lucide-react";
import type { Sede } from "../../types";

interface TrasladoTemporalModalProps {
    open: boolean;
    activoNombre: string;
    sedes: Sede[];
    sedeTemporalActualId?: string | null;
    sedeTemporalActualHasta?: string | null;
    onClose: () => void;
    onSave: (sedeTemporalId: string, sedeTemporalHasta: string) => Promise<void>;
    onCancelarTraslado?: () => Promise<void>;
}

export default function TrasladoTemporalModal({
    open,
    activoNombre,
    sedes,
    sedeTemporalActualId,
    sedeTemporalActualHasta,
    onClose,
    onSave,
    onCancelarTraslado,
}: TrasladoTemporalModalProps) {
    const [sedeId, setSedeId] = useState(sedeTemporalActualId ?? "");
    const [fechaLimite, setFechaLimite] = useState(sedeTemporalActualHasta ? sedeTemporalActualHasta.slice(0, 10) : "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const hayTrasladoActivo = Boolean(sedeTemporalActualId);

    async function handleSave() {
        if (!sedeId || !fechaLimite) {
            setError("Selecciona una sede destino y una fecha límite.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSave(sedeId, new Date(fechaLimite).toISOString());
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar el traslado.");
        } finally {
            setSaving(false);
        }
    }

    async function handleCancelarTraslado() {
        if (!onCancelarTraslado) return;
        setSaving(true);
        setError(null);
        try {
            await onCancelarTraslado();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cancelar el traslado.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#3d3d42]">Autorizar traslado temporal</h2>
                    <button onClick={onClose} className="text-[#9898a0] hover:text-[#3d3d42]">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-[#9898a0] mb-4">
                    Mientras el traslado esté vigente, el sistema no generará alertas de "fuera de sede" para{" "}
                    <strong className="text-[#3d3d42]">{activoNombre}</strong> si reporta desde la sede destino.
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-[#9898a0] mb-1 block">Sede destino</label>
                        <select
                            value={sedeId}
                            onChange={(e) => setSedeId(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#3d3d42]"
                        >
                            <option value="">Selecciona una sede</option>
                            {sedes.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} — {s.ciudad}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-[#9898a0] mb-1 block">Fecha límite del traslado</label>
                        <input
                            type="date"
                            value={fechaLimite}
                            onChange={(e) => setFechaLimite(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#3d3d42]"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div>
                        {hayTrasladoActivo && onCancelarTraslado && (
                            <button onClick={handleCancelarTraslado} disabled={saving} className="text-sm text-red-500 hover:underline disabled:opacity-50">
                                Cancelar Traslado
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={saving} className="text-sm text-[#686971] px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                            Cerrar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#519d99] hover:bg-[#3d7a76] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Autorizar traslado"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}