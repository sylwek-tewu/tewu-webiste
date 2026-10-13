/**
 * Caps how long we wait for a promise. Never rejects: a timeout or a rejection
 * both resolve to `fallback`, so callers can keep a hard response-time budget.
 * The underlying work is not cancelled, only no longer awaited.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise.catch(() => fallback), timeout]).finally(() => clearTimeout(timer));
}
