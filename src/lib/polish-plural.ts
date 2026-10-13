/** "1 godzina", "2 godziny", "5 godzin", "22 godziny" (nominative/accusative). */
export function formatHoursPl(n: number): string {
  if (n === 1) return '1 godzina';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  const few = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  return `${n} ${few ? 'godziny' : 'godzin'}`;
}
