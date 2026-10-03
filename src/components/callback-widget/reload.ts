/** Separate module so tests can replace it (jsdom cannot spy on location.reload). */
export function reloadPage(): void {
  window.location.reload();
}
