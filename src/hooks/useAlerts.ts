import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface UseAlertsOptions {
  limit?: number;
  activoId?: string;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { limit, activoId } = options;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    let query = supabase.from("alertas_con_activo").select("*").order("created_at", { ascending: false });

    if (activoId) query = query.eq("activo_id", activoId);
    if (limit) query = query.limit(limit);

    query.then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error.message);
      else setData(data ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [limit, activoId]);

  return { data, loading, error };
}
