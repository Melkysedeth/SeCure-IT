// src/hooks/useAssets.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface ActivoConReporte {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  usuario_activo: string | null;
  ubicacion_ciudad: string | null;
  latitud: number | null;
  longitud: number | null;
  bateria: number | null;
  estado: string | null;
  timestamp_reporte: string | null;
}

export function useAssets() {
  const [data, setData] = useState<ActivoConReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("activos_con_reporte")
      .select("*")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setData(data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
