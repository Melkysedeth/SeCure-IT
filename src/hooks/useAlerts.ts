import { useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";
import type { AlertaRaw } from "../lib/alerts";

interface UseAlertsOptions {
  limit?: number;
  activoId?: string;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { limit, activoId } = options;

  // La key identifica de forma única esta combinación de filtros: dos componentes
  // que pidan los mismos parámetros comparten resultado y loading automáticamente.
  const key = `alertas_con_activo:${activoId ?? "all"}:${limit ?? "no-limit"}`;

  const fetcher = useMemo(() => {
    return async () => {
      let query = supabase.from("alertas_con_activo").select("*").order("created_at", { ascending: false });
      if (activoId) query = query.eq("activo_id", activoId);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      return { data: (data ?? []) as AlertaRaw[], error: error?.message ?? null };
    };
  }, [activoId, limit]);

  const { data, loading, error, refetch } = useCachedQuery<AlertaRaw[]>(key, fetcher);

  return { data: data ?? [], loading, error, refetch };
}
