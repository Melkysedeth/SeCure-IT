import { useMemo } from "react";
import { useAlerts } from "./useAlerts";
import { useAlertsMoviles } from "./useAlertsMoviles";
import { mapAlerta, type Alerta } from "../lib/alerts";
import type { AlertsFilters } from "../components/alerts/AlertsFilterBar";

interface UseAllAlertsOptions {
    page: number;
    pageSize: number;
    filters: AlertsFilters;
}

export function useAllAlerts({ page, pageSize, filters }: UseAllAlertsOptions) {
    // Traemos TODAS las filas que matchean filtros (sin paginar en servidor)
    // porque necesitamos mezclar dos fuentes y paginar del lado del cliente.
    const laptops = useAlerts({ filters });
    const moviles = useAlertsMoviles({ filters });

    const merged: Alerta[] = useMemo(() => {
        const a = laptops.data.map((r) => mapAlerta(r, "laptop"));
        const m = moviles.data.map((r) => mapAlerta(r, "movil"));
        return [...a, ...m].sort((x, y) => new Date(y.createdAt ?? 0).getTime() - new Date(x.createdAt ?? 0).getTime());
    }, [laptops.data, moviles.data]);

    const total = merged.length;
    const start = (page - 1) * pageSize;
    const pageData = merged.slice(start, start + pageSize);

    return {
        data: pageData,
        total,
        loading: laptops.loading || moviles.loading,
        error: laptops.error || moviles.error,
        refetch: () => {
            laptops.refetch();
            moviles.refetch();
        },
    };
}