import { useEffect, useRef } from "react";

/**
 * Llama a `fn` inmediatamente al montar (o cuando `active` pasa a true)
 * y luego cada `intervalMs` ms mientras `active` sea true.
 * Se cancela automáticamente al desmontar.
 *
 * Uso típico:
 *   useAutoRefresh(fetchEnrichStatus, 15_000, view === "stores")
 *   useAutoRefresh(fetchStats,        30_000, view === "stats")
 */
export function useAutoRefresh(fn, intervalMs = 15_000, active = true) {
  // Guardamos siempre la versión más fresca de fn sin resetear el intervalo
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;

    fnRef.current(); // llamada inmediata al activar

    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}
