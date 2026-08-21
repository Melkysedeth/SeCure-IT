import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";
import type { ActivoConReporte } from "../types";

const ASSETS_KEY = "activos_con_reporte:all";

function mapMovilARow(m: any) {
  return {
    id: m.id,
    codigo: m.codigo,
    tipo: m.tipo,
    nombre_equipo: m.nombre_dispositivo,
    marca: m.marca,
    modelo: m.modelo,
    usuario_activo: m.usuario_asignado,
    nombre_responsable: m.nombre_responsable,
    departamento: m.departamento,
    numero_docume: m.numero_documento,
    ubicacion_ciudad: null,
    ciudad_asignada: null,
    latitud: m.latitud,
    longitud: m.longitud,
    estado: m.estado,
    bateria: m.bateria_nivel,
    timestamp_reporte: m.timestamp_reporte,
    ip_publica: m.ip_local,
    sistema_op: m.android_version ? `Android ${m.android_version}` : null,
  };
}

async function fetchAssets() {
  const [laptops, moviles] = await Promise.all([
    supabase.from("activos_con_reporte").select("*"),
    supabase.from("activos_moviles_con_reporte").select("*"),
  ]);

  if (laptops.error) return { data: [], error: laptops.error.message };
  if (moviles.error) return { data: [], error: moviles.error.message };

  const combinado = [...(laptops.data ?? []), ...(moviles.data ?? []).map(mapMovilARow)];
  return { data: combinado as ActivoConReporte[], error: null };
}

export function useAssets() {
  const { data, loading, error, refetch } = useCachedQuery<ActivoConReporte[]>(ASSETS_KEY, fetchAssets);
  return { data: data ?? [], loading, error, refetch };
}