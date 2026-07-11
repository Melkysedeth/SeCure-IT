import { supabase } from "./supabase";
import type { NuevoActivoForm } from "../types";

export async function actualizarActivo(activoId: string, data: NuevoActivoForm): Promise<void> {
  const { error } = await supabase
    .from("activos")
    .update({
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
    })
    .eq("id", activoId);

  if (error) {
    throw new Error(`No se pudo actualizar el activo: ${error.message}`);
  }
}

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
