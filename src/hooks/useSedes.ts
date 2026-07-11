import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";
import type { Sede } from "../types";

const SEDES_KEY = "sedes:all";

async function fetchSedes() {
  const { data, error } = await supabase.from("sedes").select("*").order("nombre", { ascending: true });
  return { data: (data ?? []) as Sede[], error: error?.message ?? null };
}

export function useSedes() {
  const { data, loading, error, refetch } = useCachedQuery<Sede[]>(SEDES_KEY, fetchSedes);
  return { data: data ?? [], loading, error, refetch };
}
