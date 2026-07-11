import { supabase } from "./supabase";

export interface NuevaSedeForm {
  nombre: string;
  ciudad: string;
  direccion: string;
  latitud: number;
  longitud: number;
  bssids: string[];
}

export async function crearSede(data: NuevaSedeForm): Promise<void> {
  const { data: sede, error: sedeError } = await supabase
    .from("sedes")
    .insert({
      nombre: data.nombre,
      ciudad: data.ciudad,
      direccion: data.direccion || null,
      latitud: data.latitud,
      longitud: data.longitud,
    })
    .select("id")
    .single();

  if (sedeError || !sede) {
    throw new Error(sedeError?.message ?? "No se pudo crear la sede.");
  }

  const bssids = data.bssids.map((b) => b.trim()).filter(Boolean);
  if (bssids.length === 0) return;

  const { error: bssidsError } = await supabase.from("sede_bssids").insert(bssids.map((bssid) => ({ sede_id: sede.id, bssid })));

  if (bssidsError) {
    throw new Error(`La sede se creó, pero falló el registro de las redes: ${bssidsError.message}`);
  }
}

export async function fetchBssidsDeSede(sedeId: string): Promise<string[]> {
  const { data, error } = await supabase.from("sede_bssids").select("bssid").eq("sede_id", sedeId);
  if (error) {
    throw new Error(`No se pudieron cargar las redes de la sede: ${error.message}`);
  }
  return (data ?? []).map((b) => b.bssid);
}

export async function actualizarSede(sedeId: string, data: NuevaSedeForm): Promise<void> {
  const { error: sedeError } = await supabase
    .from("sedes")
    .update({
      nombre: data.nombre,
      ciudad: data.ciudad,
      direccion: data.direccion || null,
      latitud: data.latitud,
      longitud: data.longitud,
    })
    .eq("id", sedeId);

  if (sedeError) {
    throw new Error(`No se pudo actualizar la sede: ${sedeError.message}`);
  }

  // Reconciliamos las redes borrando las existentes y reinsertando la lista
  // actual — más simple que calcular altas/bajas/renombres fila por fila.
  const { error: deleteError } = await supabase.from("sede_bssids").delete().eq("sede_id", sedeId);
  if (deleteError) {
    throw new Error(`La sede se actualizó, pero falló la actualización de las redes: ${deleteError.message}`);
  }

  const bssids = data.bssids.map((b) => b.trim()).filter(Boolean);
  if (bssids.length === 0) return;

  const { error: bssidsError } = await supabase.from("sede_bssids").insert(bssids.map((bssid) => ({ sede_id: sedeId, bssid })));
  if (bssidsError) {
    throw new Error(`La sede se actualizó, pero falló el registro de las redes: ${bssidsError.message}`);
  }
}

export async function eliminarSede(sedeId: string): Promise<void> {
  const { error } = await supabase.from("sedes").delete().eq("id", sedeId);
  if (error) {
    if (error.code === "23503") {
      throw new Error("No se puede eliminar: hay activos asignados a esta sede. Reasígnalos primero a otra sede.");
    }
    throw new Error(`No se pudo eliminar la sede: ${error.message}`);
  }
}
