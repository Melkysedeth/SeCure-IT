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
      const { data, error } = await supabase.from("alertas_filtros_opciones").select("*");
      return { data: (data ?? []) as AlertaOpcion[], error: error?.message ?? null };
    };
  }, []);

  const { data, loading, error } = useCachedQuery<AlertaOpcion[]>("alertas_filtros_opciones", fetcher);

  return { data: data ?? [], loading, error };
}