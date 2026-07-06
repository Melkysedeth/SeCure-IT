import { useState } from "react";
import { Laptop, X } from "lucide-react";
import type { NuevoActivoForm, TipoActivo, TipoDocumento, EstadoActivo } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevoActivoForm) => Promise<void>;
}

const TIPOS: { value: TipoActivo; label: string }[] = [
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "celular", label: "Celular" },
];

const MARCAS = ["Dell", "HP", "Lenovo", "Asus", "Samsung", "Xiaomi", "Motorola", "Otra"];
const DOCUMENTOS: { value: TipoDocumento; label: string }[] = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PPT", label: "Permiso de Protección Temporal" },
];
// "En línea" primero: un activo recién registrado se asume operativo desde ya.
const ESTADOS: { value: EstadoActivo; label: string }[] = [
  { value: "en_linea", label: "En línea" },
  { value: "sin_conexion", label: "Sin conexión" },
  { value: "fuera_sede", label: "Fuera de sede" },
];

const initialForm: NuevoActivoForm = {
  codigo: "",
  nombre_equipo: "",
  tipo: "",
  serial: "",
  marca: "",
  modelo: "",
  sistema_op: "",
  version_so: "",
  dominio: "",
  nombre_responsable: "",
  tipo_documento: "",
  numero_documento: "",
  departamento: "",
  direccion: "",
  ciudad_asignada: "",
  observaciones: "",
  procesador: "",
  memoria_ram: "",
  almacenamiento: "",
  direccion_mac: "",
  estado_inicial: "en_linea",
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

export default function RegisterAssetModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<NuevoActivoForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function update<K extends keyof NuevoActivoForm>(key: K, value: NuevoActivoForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el activo. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#519d99]/10 p-2 rounded-lg">
              <Laptop className="text-[#519d99]" size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#3d3d42]">Registrar nuevo activo</h2>
              <p className="text-xs text-[#9898a0]">Completa la información para registrar un nuevo activo en el sistema.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9898a0] hover:text-[#3d3d42]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-6">
          {/* Información básica */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[#3d3d42]">Información básica</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Código del activo" required>
                <input className={inputClass} placeholder="Ej: P154" value={form.codigo} onChange={(e) => update("codigo", e.target.value)} required />
              </Field>
              <Field label="Nombre del equipo" required>
                <input className={inputClass} placeholder="Ej: HP EliteBook 840" value={form.nombre_equipo} onChange={(e) => update("nombre_equipo", e.target.value)} required />
              </Field>
              <Field label="Tipo de activo" required>
                <select className={inputClass} value={form.tipo} onChange={(e) => update("tipo", e.target.value as TipoActivo)} required>
                  <option value="">Seleccionar tipo</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Número de serie">
                <input className={inputClass} placeholder="Ej: 5CD1234A8C" value={form.serial} onChange={(e) => update("serial", e.target.value)} />
              </Field>
              <Field label="Marca" required>
                <select className={inputClass} value={form.marca} onChange={(e) => update("marca", e.target.value)} required>
                  <option value="">Seleccionar marca</option>
                  {MARCAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Modelo" required>
                <input className={inputClass} placeholder="Ej: EliteBook 840 G8" value={form.modelo} onChange={(e) => update("modelo", e.target.value)} required />
              </Field>

              <Field label="Sistema operativo">
                <input className={inputClass} placeholder="Ej: Windows 11 Pro" value={form.sistema_op} onChange={(e) => update("sistema_op", e.target.value)} />
              </Field>
              <Field label="Versión">
                <input className={inputClass} placeholder="Ej: 23H2" value={form.version_so} onChange={(e) => update("version_so", e.target.value)} />
              </Field>
              <Field label="Dominio">
                <input className={inputClass} placeholder="Ej: EMPRESA.LOCAL" value={form.dominio} onChange={(e) => update("dominio", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Asignación */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[#3d3d42]">Asignación</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Tipo de documento" required>
                <select className={inputClass} value={form.tipo_documento} onChange={(e) => update("tipo_documento", e.target.value as TipoDocumento)} required>
                  <option value="">Seleccionar</option>
                  {DOCUMENTOS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="N° de documento" required>
                <input className={inputClass} placeholder="Ej: 1045745327" value={form.numero_documento} onChange={(e) => update("numero_documento", e.target.value)} required />
              </Field>
              <Field label="Nombre del responsable" required>
                <input className={inputClass} placeholder="Ej: Jessica Molina" value={form.nombre_responsable} onChange={(e) => update("nombre_responsable", e.target.value)} required />
              </Field>

              <Field label="Departamento / Área" required>
                <input className={inputClass} placeholder="Ej: Dirección ejecutiva / Asuntos médicos" value={form.departamento} onChange={(e) => update("departamento", e.target.value)} required />
              </Field>
              <Field label="Ciudad asignada" required>
                <input className={inputClass} placeholder="Ej: Bogotá" value={form.ciudad_asignada} onChange={(e) => update("ciudad_asignada", e.target.value)} required />
              </Field>
              <Field label="Dirección" required>
                <input className={inputClass} placeholder="Ej: Cra 58 # 75-158" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} required />
              </Field>

              <Field label="Estado inicial" required>
                <select className={inputClass} value={form.estado_inicial} onChange={(e) => update("estado_inicial", e.target.value as EstadoActivo)} required>
                  {ESTADOS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Observaciones">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                maxLength={255}
                placeholder="Información adicional sobre el activo (opcional)"
                value={form.observaciones}
                onChange={(e) => update("observaciones", e.target.value)}
              />
              <p className="text-[10px] text-[#9898a0] text-right">{form.observaciones.length}/255</p>
            </Field>
          </div>

          {/* Specs técnicas */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[#3d3d42]">Especificaciones técnicas (opcional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Procesador (CPU)">
                <input className={inputClass} placeholder="Ej: Intel Core i5-1135G7" value={form.procesador} onChange={(e) => update("procesador", e.target.value)} />
              </Field>
              <Field label="Memoria RAM">
                <input className={inputClass} placeholder="Ej: 16 GB" value={form.memoria_ram} onChange={(e) => update("memoria_ram", e.target.value)} />
              </Field>
              <Field label="Almacenamiento">
                <input className={inputClass} placeholder="Ej: 512 GB SSD" value={form.almacenamiento} onChange={(e) => update("almacenamiento", e.target.value)} />
              </Field>

              <Field label="Dirección MAC">
                <input className={inputClass} placeholder="Ej: 00:1A:2B:3C:4D:5E" value={form.direccion_mac} onChange={(e) => update("direccion_mac", e.target.value)} />
              </Field>
            </div>
          </div>

          {error && <div className="px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}

          {/* Footer */}
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
              {saving ? "Guardando..." : "Guardar activo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
