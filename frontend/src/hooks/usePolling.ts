import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Poll an async function on an interval and expose its latest result.
 * Prototype real-time: no WebSockets, just a short polling loop.
 */
export function usePolling<T>(
  fn: () => Promise<T>,
  intervalMs = 4000,
): { data: T | null; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const tick = useCallback(async () => {
    try {
      setData(await fnRef.current());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);

  return { data, error, refresh: tick };
}
