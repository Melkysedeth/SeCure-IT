import { useCallback, useRef, useSyncExternalStore } from "react";

interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

interface Entry<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchedAt: number;
  promise: Promise<void> | null;
  listeners: Set<() => void>;
}

// Cuánto tiempo se considera "fresco" un dato cacheado antes de revalidar
// en segundo plano al volver a montar un componente que lo pide.
const DEFAULT_STALE_TIME_MS = 30_000;

const store = new Map<string, Entry<any>>();

function getInternal<T>(key: string): Entry<T> {
  let entry = store.get(key);
  if (!entry) {
    entry = { data: null, error: null, loading: false, fetchedAt: 0, promise: null, listeners: new Set() };
    store.set(key, entry);
  }
  return entry;
}

// Reemplaza la entrada por una nueva referencia (no mutamos in-place) para
// que useSyncExternalStore detecte el cambio correctamente, y notifica a
// todos los componentes suscritos a esa key.
function setInternal<T>(key: string, patch: Partial<Entry<T>>): Entry<T> {
  const prev = getInternal<T>(key);
  const next: Entry<T> = { ...prev, ...patch };
  store.set(key, next);
  next.listeners.forEach((listener) => listener());
  return next;
}

function load<T>(key: string, fetcher: () => Promise<QueryResult<T>>, staleTimeMs: number): Promise<void> {
  const entry = getInternal<T>(key);

  // Ya hay una petición en curso para esta key: la reutilizamos en vez de duplicarla.
  if (entry.promise) return entry.promise;

  // Si hay datos frescos, no hacemos nada (ni loading, ni red).
  const isFresh = entry.data !== null && Date.now() - entry.fetchedAt < staleTimeMs;
  if (isFresh) return Promise.resolve();

  const hadData = entry.data !== null;

  const promise: Promise<void> = fetcher()
    .then(({ data, error }) => {
      setInternal<T>(key, {
        data: error ? entry.data : data,
        error,
        loading: false,
        fetchedAt: Date.now(),
        promise: null,
      });
    })
    .catch((err: unknown) => {
      setInternal<T>(key, {
        error: err instanceof Error ? err.message : "Error desconocido",
        loading: false,
        promise: null,
      });
    });

  // Solo mostramos el estado de carga si NO había datos previos que mostrar mientras tanto.
  setInternal<T>(key, { loading: !hadData, promise });
  return promise;
}

export function invalidateQuery(key: string) {
  // OJO: antes esto hacía store.delete(key), lo que borraba también la lista
  // de componentes suscritos (listeners) a esa key. El siguiente load() creaba
  // una entrada nueva con listeners vacíos, así que cuando el fetch terminaba
  // nadie se enteraba y el loading se quedaba colgado para siempre, aunque los
  // datos sí hubieran llegado bien del servidor. En vez de borrar la entrada,
  // solo marcamos los datos como viejos para forzar una revalidación real,
  // preservando quién está suscrito.
  const entry = store.get(key);
  if (entry) setInternal(key, { fetchedAt: 0 });
}

export function useCachedQuery<T>(key: string, fetcher: () => Promise<QueryResult<T>>, options?: { staleTimeMs?: number }) {
  const staleTimeMs = options?.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const entry = getInternal(key);
      entry.listeners.add(onStoreChange);
      load(key, fetcherRef.current, staleTimeMs);
      return () => {
        entry.listeners.delete(onStoreChange);
      };
    },
    [key, staleTimeMs],
  );

  const getSnapshot = useCallback(() => getInternal<T>(key), [key]);

  const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const refetch = useCallback(() => {
    return load(key, fetcherRef.current, 0);
  }, [key]);

  return {
    data: entry.data,
    loading: entry.loading,
    error: entry.error,
    refetch,
  };
}
