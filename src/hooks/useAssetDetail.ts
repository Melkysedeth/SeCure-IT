import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type OrigenActivo = "laptop" | "movil";

export function useAssetDetail(codigo: string | undefined) {
  const [data, setData] = useState<any | null>(null);
  const [origen, setOrigen] = useState<OrigenActivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!codigo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const laptop = await supabase.from("activos_con_reporte").select("*").eq("codigo", codigo).maybeSingle();

    if (laptop.error) {
      setError(laptop.error.message);
      setLoading(false);
      return;
    }

    if (laptop.data) {
      setData(laptop.data);
      setOrigen("laptop");
      setLoading(false);
      return;
    }

    // No es laptop/desktop — probamos en móviles antes de dar por perdido.
    const movil = await supabase.from("activos_moviles_con_reporte").select("*").eq("codigo", codigo).maybeSingle();

    if (movil.error) {
      setError(movil.error.message);
    } else {
      setData(movil.data);
      setOrigen(movil.data ? "movil" : null);
    }
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

  return { data, origen, loading, error, refetch: fetchData };
}