import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Periferico {
    tipo: string;
    nombre: string;
    fabricante: string | null;
    detectado_en: string;
}

export function useAssetPeripherals(activoId: string | undefined) {
    const [data, setData] = useState<Periferico[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activoId) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        supabase
            .from("perifericos_por_activo")
            .select("tipo, nombre, fabricante, detectado_en")
            .eq("activo_id", activoId)
            .then(({ data, error }) => {
                setData(error ? [] : (data as Periferico[]));
                setLoading(false);
            });
    }, [activoId]);

    return { data, loading };
}