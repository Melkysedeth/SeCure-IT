import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";

export interface ReporteRaw {
  id: string;
  activo_id: string;
  usuario_activo: string | null;
  ip_local: string | null;
  ip_publica: string | null;
  red_wifi: string | null;
  ubicacion_ciudad: string | null;
  latitud: number | null;
  longitud: number | null;
  bateria: number | null;
  estado: string | null;
  version_agente: string | null;
  timestamp_reporte: string | null;
}

const REPORTES_KEY = "reportes:historial";

// OJO: limitado a los últimos 1000 reportes. Con el ritmo de reporte de cada
// 4-6 horas por equipo, esto alcanza para bastante tiempo, pero si la tabla
// `reportes` crece mucho (muchos equipos, mucho historial acumulado), en
// algún momento va a hacer falta paginar esto desde el servidor en vez de
// traer todo y filtrar en el navegador. Por ahora, con la escala actual, está bien.
async function fetchReportes() {
  const { data, error } = await supabase.from("reportes").select("*").order("timestamp_reporte", { ascending: false }).limit(1000);
  return { data: (data ?? []) as ReporteRaw[], error: error?.message ?? null };
}

export function useReportes() {
  const { data, loading, error, refetch } = useCachedQuery<ReporteRaw[]>(REPORTES_KEY, fetchReportes);
  return { data: data ?? [], loading, error, refetch };
}
