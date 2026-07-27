import { useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";

export interface AlertsKPIData {
  total: number;
  activas: number;
  criticas: number;
  altas: number;
  resueltas: number;
}

const EMPTY: AlertsKPIData = { total: 0, activas: 0, criticas: 0, altas: 0, resueltas: 0 };

export function useAlertsKPIs() {
  const fetcher = useMemo(() => {
    return async () => {
      const { data, error } = await supabase.from("alertas_kpis").select("*").single();
      return { data: (data as AlertsKPIData) ?? EMPTY, error: error?.message ?? null };
    };
  }, []);

  const { data, loading, error } = useCachedQuery<AlertsKPIData>("alertas_kpis", fetcher);

  return { data: data ?? EMPTY, loading, error };
}