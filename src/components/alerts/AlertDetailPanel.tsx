import { useState, type ReactNode } from "react";
import { X, Laptop, Check, Ban } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SEVERITY_META, ESTADO_META, formatFecha, timeAgo, type Alerta, type EstadoAlerta } from "../../lib/alerts";

interface Props {
  alerta: Alerta;
  onClose: () => void;
  onUpdated: (id: string, estado: EstadoAlerta) => void;
}

export default function AlertDetailPanel({ alerta, onClose, onUpdated }: Props) {
  const [tab, setTab] = useState<"Detalles" | "Historial" | "Comentarios">("Detalles");
  const [saving, setSaving] = useState(false);

  const meta = SEVERITY_META[alerta.severidad];
  const estadoMeta = ESTADO_META[alerta.estado];

  async function marcarComo(estado: EstadoAlerta) {
    setSaving(true);
    // Resolver manualmente NO confirma de una vez: queda "pendiente_confirmacion"
    // hasta que el agente instalado en el equipo reporte específicamente
    // en_linea. Ese reporte es lo único que cierra la alerta de verdad
    // (estado = 'resuelta'), vía el trigger generar_alerta_por_estado.
    const dbEstado = estado === "Resuelta" ? "pendiente_confirmacion" : estado === "PendienteConfirmacion" ? "pendiente_confirmacion" : "activa";

    const payload = { estado: dbEstado, resolved_at: null };

    const { error } = await supabase.from("alertas").update(payload).eq("id", alerta.id);
    setSaving(false);
    if (error) {
      console.error("Error actualizando alerta:", error.message);
      return;
    }
    // Reflejamos en la UI el estado real que quedó guardado (pendiente, no resuelta).
    onUpdated(alerta.id, estado === "Resuelta" ? "PendienteConfirmacion" : estado);
  }

  return (
    <aside className="w-[340px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-[15px] font-semibold text-[#3d3d42] pr-2">{alerta.tipo}</h2>
          <button onClick={onClose} className="text-[#9898a0] hover:text-[#3d3d42] shrink-0">
            <X size={16} />
          </button>
        </div>
        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${estadoMeta.badgeClass}`}>{estadoMeta.label}</span>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#686971]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
          {meta.label}
          <span className="text-[#d0d0d6]">•</span>
          ID: {alerta.id.slice(0, 8)}
        </div>
      </div>

      <div className="flex border-b border-gray-100 px-5">
        {(["Detalles", "Historial", "Comentarios"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-1 py-3 mr-5 text-[13px] border-b-2 -mb-px transition-colors ${tab === t ? "border-[#519d99] text-[#519d99] font-medium" : "border-transparent text-[#9898a0]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Detalles" && (
        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <Laptop size={18} className="text-[#686971]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#3d3d42]">
                {alerta.nombreEquipo} ({alerta.codigo})
              </div>
            </div>
          </div>

          <DetailField label="Descripción">{alerta.descripcion || "Sin descripción"}</DetailField>
          <DetailField label="Responsable">
            {alerta.responsable}
            {alerta.departamento ? ` (${alerta.departamento})` : ""}
          </DetailField>
          <DetailField label="Ubicación">{alerta.ciudad}</DetailField>
          <DetailField label="Fecha y hora" sub={timeAgo(alerta.createdAt)}>
            {formatFecha(alerta.createdAt)}
          </DetailField>
          <DetailField label="Tipo de alerta">{alerta.tipo}</DetailField>
          <DetailField label="Estado">
            <span className={`inline-flex items-center gap-1.5 ${alerta.estado === "Activa" ? "text-red-500" : alerta.estado === "PendienteConfirmacion" ? "text-amber-600" : "text-emerald-600"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" /> {estadoMeta.label}
            </span>
          </DetailField>
          {alerta.estado === "PendienteConfirmacion" && <p className="text-[11px] text-[#9898a0] -mt-3">Se marcará como resuelta automáticamente cuando el equipo vuelva a reportar en línea.</p>}
        </div>
      )}

      {tab === "Historial" && <div className="p-5 text-sm text-[#9898a0]">Próximamente: línea de tiempo de eventos de esta alerta (creación, cambios de estado, comentarios del sistema).</div>}

      {tab === "Comentarios" && <div className="p-5 text-sm text-[#9898a0]">Aún no hay comentarios en esta alerta.</div>}

      <div className="mt-auto p-5 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={() => marcarComo("Resuelta")}
          disabled={saving || alerta.estado !== "Activa"}
          className="w-full bg-[#519d99] hover:bg-[#3d7a76] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Check size={15} /> {saving ? "Guardando..." : "Marcar como resuelta"}
        </button>
        {alerta.estado !== "Activa" && (
          <button
            onClick={() => marcarComo("Activa")}
            disabled={saving}
            className="w-full border border-gray-200 text-[#686971] hover:bg-gray-50 disabled:opacity-50 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Ban size={15} /> Reabrir alerta
          </button>
        )}
      </div>
    </aside>
  );
}

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  sub?: string;
}

function DetailField({ label, children, sub }: DetailFieldProps) {
  return (
    <div>
      <div className="text-[11px] text-[#9898a0] mb-0.5">{label}</div>
      <div className="text-[13px] text-[#3d3d42]">{children}</div>
      {sub && <div className="text-[11px] text-[#9898a0]">{sub}</div>}
    </div>
  );
}
