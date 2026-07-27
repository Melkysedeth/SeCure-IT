import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAssetDetail(codigo: string | undefined) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!codigo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("activos_con_reporte")
      .select("*")
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) setError(error.message);
    else setData(data);
    setLoading(false);
  }, [codigo]);

  useEffect(() => {
    let active = true;
    fetchData().then(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}