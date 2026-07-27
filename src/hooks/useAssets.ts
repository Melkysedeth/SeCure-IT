import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";
import type { ActivoConReporte } from "../types";

const ASSETS_KEY = "activos_con_reporte:all";

async function fetchAssets() {
  const { data, error } = await supabase.from("activos_con_reporte").select("*");
  return { data: (data ?? []) as ActivoConReporte[], error: error?.message ?? null };
}

export function useAssets() {
  const { data, loading, error, refetch } = useCachedQuery<ActivoConReporte[]>(ASSETS_KEY, fetchAssets);
  return { data: data ?? [], loading, error, refetch };
}