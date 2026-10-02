/** Requests filled in faster than this are treated as bots and silently ignored by the API. */
export const MIN_FILL_TIME_MS = 2000;

/** How long the form should hold a submission so a fast human is never mistaken for a bot. */
export function getSubmitDelayMs(elapsedMs: number): number {
  return Math.max(0, MIN_FILL_TIME_MS - elapsedMs);
}
