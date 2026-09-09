import { useState, useEffect, useRef } from "react";
import {
  Laptop, Monitor, Tablet, Smartphone, X, ChevronDown, Check,
  ScanLine, Fingerprint, Phone, CreditCard, Hash, Calendar, DollarSign,
  User, Building2, MapPin, StickyNote,
} from "lucide-react";
import type { NuevoActivoForm, TipoActivo, TipoDocumento } from "../../types";
import { useSedes } from "../../hooks/useSedes";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevoActivoForm) => Promise<void>;
  initialData?: NuevoActivoForm | null;
}

const TIPOS: { value: TipoActivo; label: string; icon: React.ElementType }[] = [
  { value: "laptop", label: "Computador / Laptop", icon: Laptop },
  { value: "desktop", label: "Computador de escritorio", icon: Monitor },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "celular", label: "Celular", icon: Smartphone },
];

const DOCUMENTOS: { value: TipoDocumento; label: string }[] = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PPT", label: "Permiso de Protección Temporal" },
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
  sede_id: "",
  observaciones: "",
  procesador: "",
  memoria_ram: "",
  almacenamiento: "",
  direccion_mac: "",
  imei: "",
  numero_telefono: "",
  fecha_compra: "",
  costo: "",
};

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] placeholder:text-[#b0b0b8] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]";

function Field({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#3d3d42]">
        <Icon size={13} className="text-[#519d99]" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Selector custom de tipo de activo, con icono por opción (un <select> nativo no puede mostrar esto). */
function TipoActivoSelect({
  value,
  onChange,
}: {
  value: TipoActivo | "";
  onChange: (v: TipoActivo) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seleccionado = TIPOS.find((t) => t.value === value);
  const IconSeleccionado = seleccionado?.icon ?? Laptop;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className="flex items-center gap-2">
          <IconSeleccionado size={15} className={seleccionado ? "text-[#519d99]" : "text-[#b0b0b8]"} />
          <span className={seleccionado ? "text-[#3d3d42]" : "text-[#b0b0b8]"}>
            {seleccionado ? seleccionado.label : "Seleccionar tipo"}
          </span>
        </span>
        <ChevronDown size={15} className={`text-[#9898a0] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* input oculto para que "required" siga funcionando con este control custom */}
      <input
        tabIndex={-1}
        value={value}
        required
        onChange={() => { }}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none -z-10"
      />

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white border border-gray-100 rounded-lg shadow-lg py-1.5 overflow-hidden">
          {TIPOS.map((t) => {
            const Icon = t.icon;
            const activo = t.value === value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => { onChange(t.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${activo ? "bg-[#519d99]/10 text-[#519d99] font-medium" : "text-[#3d3d42] hover:bg-gray-50"
                  }`}
              >
                <div className={`p-1 rounded-md ${activo ? "bg-[#519d99]/15" : "bg-gray-100"}`}>
                  <Icon size={14} className={activo ? "text-[#519d99]" : "text-[#686971]"} />
                </div>
                <span className="flex-1 text-left">{t.label}</span>
                {activo && <Check size={14} className="text-[#519d99]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RegisterAssetModal({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState<NuevoActivoForm>(initialData ?? initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: sedes } = useSedes();
  const isEditing = initialData != null;
  const esMovil = form.tipo === "celular" || form.tipo === "tablet";

  useEffect(() => {
    if (open) {
      setForm(initialData ?? initialForm);
      setCurrentStep(0);
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  function update<K extends keyof NuevoActivoForm>(key: K, value: NuevoActivoForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const HeaderIcon = TIPOS.find((t) => t.value === form.tipo)?.icon ?? Laptop;

  const steps = [
    { title: "Información básica", description: "Identifica el equipo dentro del inventario.", icon: HeaderIcon },
    { title: "Asignación y responsable", description: "Define quién está a cargo y su ubicación.", icon: User },
    { title: "Información adicional", description: "Observaciones o notas relevantes (opcional).", icon: StickyNote },
  ];
  const isLastStep = currentStep === steps.length - 1;

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setForm(initialForm);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el activo. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#519d99]/10 p-2.5 rounded-xl">
              <HeaderIcon className="text-[#519d99]" size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#3d3d42]">{isEditing ? "Editar activo" : "Registrar nuevo activo"}</h2>
              <p className="text-xs text-[#9898a0]">
                {isEditing ? "Actualiza la información del activo." : "Completa la información para registrar un nuevo activo en el sistema."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9898a0] hover:text-[#3d3d42]">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar de pasos — solo en pantallas sm+ */}
          <div className="hidden sm:flex flex-col w-56 border-r border-gray-100 px-5 py-6 shrink-0 overflow-y-auto">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const isLast = i === steps.length - 1;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(i)}
                  className="flex gap-3 text-left"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${isDone
                        ? "bg-[#519d99] text-white"
                        : isActive
                          ? "border-2 border-[#519d99] text-[#519d99] bg-white"
                          : "border-2 border-gray-200 text-[#b0b0b8] bg-white"
                        }`}
                    >
                      {isDone ? <Check size={14} /> : i + 1}
                    </div>
                    {!isLast && <div className={`w-px flex-1 mt-1 ${isDone ? "bg-[#519d99]" : "bg-gray-200"}`} />}
                  </div>
                  <div className="pb-7">
                    <p className={`text-sm font-semibold ${isActive ? "text-[#519d99]" : isDone ? "text-[#3d3d42]" : "text-[#9898a0]"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-[#9898a0] mt-0.5">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Indicador de progreso — solo en mobile */}
            <div className="sm:hidden px-6 pt-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#519d99]">Paso {currentStep + 1} de {steps.length}</p>
                <p className="text-xs text-[#9898a0]">{steps[currentStep].title}</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#519d99] rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-6 flex flex-col gap-4">
              <div className="hidden sm:block -mt-1">
                <p className="text-xs font-semibold text-[#519d99] uppercase tracking-wide">{steps[currentStep].title}</p>
                <p className="text-xs text-[#9898a0] mt-0.5">{steps[currentStep].description}</p>
              </div>

              {/* Paso 1: Información básica */}
              {currentStep === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Código del activo" icon={Hash} required>
                      <input className={inputClass} placeholder="Ej: P154" value={form.codigo} onChange={(e) => update("codigo", e.target.value)} required />
                    </Field>
                    <Field label="Tipo de activo" icon={HeaderIcon} required>
                      <TipoActivoSelect value={form.tipo} onChange={(v) => update("tipo", v)} />
                    </Field>
                  </div>

                  {esMovil && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Serial" icon={ScanLine}>
                        <input className={inputClass} placeholder="Ej: RF8N123ABCD" value={form.serial} onChange={(e) => update("serial", e.target.value)} />
                      </Field>
                      <Field label="IMEI" icon={Fingerprint}>
                        <input className={inputClass} placeholder="Ej: 356938035643809" value={form.imei} onChange={(e) => update("imei", e.target.value)} />
                      </Field>
                      <Field label="Número de teléfono" icon={Phone}>
                        <input className={inputClass} placeholder="Ej: 3001234567" value={form.numero_telefono} onChange={(e) => update("numero_telefono", e.target.value)} />
                      </Field>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Fecha de compra" icon={Calendar}>
                      <input
                        type="date"
                        className={inputClass}
                        value={form.fecha_compra}
                        onChange={(e) => update("fecha_compra", e.target.value)}
                      />
                    </Field>
                    <Field label="Costo del equipo" icon={DollarSign}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        placeholder="Ej: 3500000"
                        value={form.costo}
                        onChange={(e) => update("costo", e.target.value)}
                      />
                    </Field>
                  </div>

                  {form.tipo && (
                    <p className="text-xs text-[#9898a0]">
                      {esMovil
                        ? "El resto de la información (nombre del equipo, marca, modelo, versión de Android, RAM, almacenamiento) se completa automáticamente con el primer reporte del agente. Serial, IMEI y número de teléfono deben registrarse manualmente."
                        : "El resto de la información (nombre del equipo, serial, marca, modelo, sistema operativo, procesador, RAM, almacenamiento, MAC e IP) se completa automáticamente con el primer reporte del agente instalado."}
                    </p>
                  )}
                </div>
              )}

              {/* Paso 2: Asignación y responsable */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Tipo de documento" icon={CreditCard} required>
                      <select className={inputClass} value={form.tipo_documento} onChange={(e) => update("tipo_documento", e.target.value as TipoDocumento)} required>
                        <option value="">Seleccionar</option>
                        {DOCUMENTOS.map((d) => (
                          <option key={d.value} value={d.value}>{d.value}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="N° de documento" icon={Hash} required>
                      <input className={inputClass} placeholder="Ej: 1045745327" value={form.numero_documento} onChange={(e) => update("numero_documento", e.target.value)} required />
                    </Field>

                    <Field label="Nombre del responsable" icon={User} required>
                      <input className={inputClass} placeholder="Ej: Jessica Molina" value={form.nombre_responsable} onChange={(e) => update("nombre_responsable", e.target.value)} required />
                    </Field>
                    <Field label="Departamento / Área" icon={Building2} required>
                      <input className={inputClass} placeholder="Ej: Dirección ejecutiva / Asuntos médicos" value={form.departamento} onChange={(e) => update("departamento", e.target.value)} required />
                    </Field>
                  </div>

                  {!esMovil && (
                    <Field label="Sede asignada" icon={MapPin} required>
                      <select className={inputClass} value={form.sede_id} onChange={(e) => update("sede_id", e.target.value)} required>
                        <option value="">Seleccionar sede</option>
                        {sedes.map((s) => (
                          <option key={s.id} value={s.id}>{s.nombre} — {s.ciudad}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {!esMovil && sedes.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Todavía no hay sedes registradas. Créalas primero desde Configuración para poder asignarlas a un activo.
                    </p>
                  )}
                </div>
              )}

              {/* Paso 3: Información adicional */}
              {currentStep === 2 && (
                <Field label="Observaciones" icon={StickyNote}>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={5}
                    maxLength={255}
                    placeholder="Información adicional sobre el activo (opcional)"
                    value={form.observaciones}
                    onChange={(e) => update("observaciones", e.target.value)}
                  />
                  <p className="text-[10px] text-[#9898a0] text-right mt-0.5">{form.observaciones.length}/255</p>
                </Field>
              )}

              {error && <div className="px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 sm:px-7 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={currentStep === 0 ? onClose : () => setCurrentStep((s) => s - 1)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-[#686971] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {currentStep === 0 ? "Cancelar" : "Atrás"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#519d99] hover:bg-[#3d7a76] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : isLastStep ? (isEditing ? "Guardar cambios" : "Guardar activo") : "Siguiente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}