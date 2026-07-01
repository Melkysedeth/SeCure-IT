import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAssetDetail(codigo: string | undefined) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    supabase
      .from("activos_con_reporte")
      .select("*")
      .eq("codigo", codigo)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setData(data);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [codigo]);

  return { data, loading, error };
}
