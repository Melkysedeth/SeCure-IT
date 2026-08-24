import { useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";

export interface AlertaOpcion {
  tipo: string | null;
  ciudad: string | null;
}

export function useAlertsFilterOptions() {
  const fetcher = useMemo(() => {
    return async () => {
      const [laptops, moviles] = await Promise.all([
        supabase.from("alertas_filtros_opciones").select("*"),
        supabase.from("alertas_moviles").select("tipo"),
      ]);

      const laptopOpts = (laptops.data ?? []) as AlertaOpcion[];
      const movilOpts = ((moviles.data ?? []) as { tipo: string | null }[]).map((r) => ({ tipo: r.tipo, ciudad: null }));

      const error = laptops.error?.message ?? moviles.error?.message ?? null;
      return { data: [...laptopOpts, ...movilOpts], error };
    };
  }, []);

  const { data, loading, error } = useCachedQuery<AlertaOpcion[]>("alertas_filtros_opciones_todas", fetcher);

  return { data: data ?? [], loading, error };
}