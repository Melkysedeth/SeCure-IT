import { useState, useEffect } from "react";
import { Building2, X, Plus, Trash2 } from "lucide-react";
import type { NuevaSedeForm } from "../../lib/sedes";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevaSedeForm) => Promise<void>;
  initialData?: FormState | null;
}

export interface FormState {
  nombre: string;
  ciudad: string;
  direccion: string;
  latitud: string;
  longitud: string;
  bssids: string[];
}

const initialForm: FormState = {
  nombre: "",
  ciudad: "",
  direccion: "",
  latitud: "",
  longitud: "",
  bssids: [""],
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#3d3d42]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] placeholder:text-[#b0b0b8] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]";

export default function AddSedeModal({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState<FormState>(initialData ?? initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = initialData != null;

  useEffect(() => {
    if (open) setForm(initialData ?? initialForm);
  }, [open, initialData]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateBssid(index: number, value: string) {
    setForm((f) => ({ ...f, bssids: f.bssids.map((b, i) => (i === index ? value : b)) }));
  }

  function addBssid() {
    setForm((f) => ({ ...f, bssids: [...f.bssids, ""] }));
  }

  function removeBssid(index: number) {
    setForm((f) => ({ ...f, bssids: f.bssids.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const latitud = Number(form.latitud);
    const longitud = Number(form.longitud);

    if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
      setError("Latitud y longitud deben ser números válidos.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        nombre: form.nombre,
        ciudad: form.ciudad,
        direccion: form.direccion,
        latitud,
        longitud,
        bssids: form.bssids,
      });
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la sede. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#519d99]/10 p-2 rounded-lg">
              <Building2 className="text-[#519d99]" size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#3d3d42]">{isEditing ? "Editar sede" : "Agregar sede"}</h2>
              <p className="text-xs text-[#9898a0]">La ubicación se usa para georreferenciar los activos asignados a esta sede.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9898a0] hover:text-[#3d3d42]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la sede" required>
              <input className={inputClass} placeholder="Ej: Sede Bogotá Norte" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
            </Field>
            <Field label="Ciudad" required>
              <input className={inputClass} placeholder="Ej: Bogotá" value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} required />
            </Field>
          </div>

          <Field label="Dirección">
            <input className={inputClass} placeholder="Ej: Cra 58 # 75-158" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitud" required>
              <input className={inputClass} placeholder="Ej: 4.678" value={form.latitud} onChange={(e) => update("latitud", e.target.value)} required inputMode="decimal" />
            </Field>
            <Field label="Longitud" required>
              <input className={inputClass} placeholder="Ej: -74.058" value={form.longitud} onChange={(e) => update("longitud", e.target.value)} required inputMode="decimal" />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#3d3d42]">Redes WiFi de la sede (BSSID)</label>
              <button type="button" onClick={addBssid} className="flex items-center gap-1 text-xs font-medium text-[#519d99] hover:text-[#3d7a76]">
                <Plus size={14} /> Agregar red
              </button>
            </div>
            <p className="text-[11px] text-[#9898a0]">
              La BSSID es la dirección MAC del punto de acceso, no el nombre de la red (SSID) — necesaria porque varias sedes pueden compartir el mismo nombre de WiFi.
            </p>
            {form.bssids.map((bssid, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputClass}
                  placeholder="Ej: AA:BB:CC:11:22:33"
                  value={bssid}
                  onChange={(e) => updateBssid(i, e.target.value)}
                />
                {form.bssids.length > 1 && (
                  <button type="button" onClick={() => removeBssid(i)} className="text-[#9898a0] hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <div className="px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-[#686971] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#519d99] hover:bg-[#3d7a76] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar sede"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
