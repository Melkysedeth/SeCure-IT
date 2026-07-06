import { supabase } from "./supabase";

/**
 * Da de baja un activo de forma permanente (hard delete).
 * Borra primero `alertas` y `reportes` (que referencian activos.id vía
 * activo_id) y al final la fila de `activos`, para que funcione sin
 * depender de si tienes ON DELETE CASCADE configurado en las FKs.
 */
export async function darDeBajaActivo(activoId: string): Promise<void> {
  const { error: alertasError } = await supabase.from("alertas").delete().eq("activo_id", activoId);
  if (alertasError) {
    throw new Error(`No se pudieron eliminar las alertas del activo: ${alertasError.message}`);
  }

  const { error: reportesError } = await supabase.from("reportes").delete().eq("activo_id", activoId);
  if (reportesError) {
    throw new Error(`No se pudieron eliminar los reportes del activo: ${reportesError.message}`);
  }

  const { error: activoError } = await supabase.from("activos").delete().eq("id", activoId);
  if (activoError) {
    throw new Error(`No se pudo eliminar el activo: ${activoError.message}`);
  }
}
