import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";

export interface ActivoConReporte {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  usuario_activo: string | null;
  ubicacion_ciudad: string | null;
  latitud: number | null;
  longitud: number | null;
  bateria: number | null;
  estado: string | null;
  timestamp_reporte: string | null;
}

const ASSETS_KEY = "activos_con_reporte:all";

async function fetchAssets() {
  const { data, error } = await supabase.from("activos_con_reporte").select("*");
  return { data: (data ?? []) as ActivoConReporte[], error: error?.message ?? null };
}

export function useAssets() {
  const { data, loading, error, refetch } = useCachedQuery<ActivoConReporte[]>(ASSETS_KEY, fetchAssets);
  return { data: data ?? [], loading, error, refetch };
}
