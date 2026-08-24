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

function sumKpis(a: AlertsKPIData, b: AlertsKPIData): AlertsKPIData {
  return {
    total: a.total + b.total,
    activas: a.activas + b.activas,
    criticas: a.criticas + b.criticas,
    altas: a.altas + b.altas,
    resueltas: a.resueltas + b.resueltas,
  };
}

export function useAlertsKPIs() {
  const fetcher = useMemo(() => {
    return async () => {
      const [laptops, moviles] = await Promise.all([
        supabase.from("alertas_kpis").select("*").single(),
        supabase.from("alertas_moviles_kpis").select("*").single(),
      ]);

      const error = laptops.error?.message ?? moviles.error?.message ?? null;
      const data = sumKpis((laptops.data as AlertsKPIData) ?? EMPTY, (moviles.data as AlertsKPIData) ?? EMPTY);

      return { data, error };
    };
  }, []);

  const { data, loading, error } = useCachedQuery<AlertsKPIData>("alertas_kpis_todas", fetcher);

  return { data: data ?? EMPTY, loading, error };
}