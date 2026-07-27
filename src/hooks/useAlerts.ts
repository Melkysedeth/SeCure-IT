import { useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useCachedQuery } from "../lib/queryCache";
import type { AlertaRaw } from "../lib/alerts";
import type { AlertsFilters } from "../components/alerts/AlertsFilterBar";

interface UseAlertsOptions {
  page?: number;
  pageSize?: number;
  activoId?: string;
  filters?: AlertsFilters;
}

// Traduce los valores de estado que usa la UI a los que existen en la columna `estado` de la BD.
function estadoUiToDb(estado: AlertsFilters["estado"]): string | null {
  switch (estado) {
    case "Activa":
      return "activa";
    case "PendienteConfirmacion":
      return "pendiente_confirmacion";
    case "Resuelta":
      return "resuelta";
    default:
      return null; // "Todos" -> sin filtro
  }
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { page = 1, pageSize, activoId, filters } = options;

  const key = `alertas_con_activo:${activoId ?? "all"}:${page}:${pageSize ?? "no-limit"}:${filters?.estado ?? "Todos"}:${filters?.severidad ?? "Todas"}:${filters?.tipo ?? "Todos"}:${filters?.ciudad ?? "Todas"}:${filters?.search ?? ""}`;

  const fetcher = useMemo(() => {
    return async () => {
      let query = supabase.from("alertas_con_activo").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (activoId) query = query.eq("activo_id", activoId);

      if (filters) {
        const estadoDb = estadoUiToDb(filters.estado);
        if (estadoDb) query = query.eq("estado", estadoDb);
        if (filters.severidad !== "Todas") query = query.eq("severidad", filters.severidad);
        if (filters.tipo !== "Todos") query = query.eq("tipo", filters.tipo);
        if (filters.ciudad !== "Todas") query = query.eq("ubicacion_ciudad", filters.ciudad);
        if (filters.search.trim()) {
          const term = filters.search.trim();
          query = query.or(
            `descripcion.ilike.%${term}%,tipo.ilike.%${term}%,nombre_equipo.ilike.%${term}%,codigo.ilike.%${term}%,nombre_responsable.ilike.%${term}%`,
          );
        }
      }

      if (pageSize) {
        query = query.range((page - 1) * pageSize, page * pageSize - 1);
      }

      const { data, error, count } = await query;
      return {
        data: { rows: (data ?? []) as AlertaRaw[], total: count ?? 0 },
        error: error?.message ?? null,
      };
    };
  }, [activoId, page, pageSize, filters]);

  const { data, loading, error, refetch } = useCachedQuery<{ rows: AlertaRaw[]; total: number }>(key, fetcher);

  return { data: data?.rows ?? [], total: data?.total ?? 0, loading, error, refetch };
}