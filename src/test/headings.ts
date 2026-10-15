/** Heading levels (1-6) in document order. */
export function headingLevels(root: ParentNode): number[] {
  return Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el) => Number(el.tagName[1]));
}

/**
 * Problems with the heading outline, empty when it is sound: the page starts with an h1,
 * and a heading is never more than one level deeper than the one before it (going up is fine).
 */
export function headingOutlineProblems(root: ParentNode): string[] {
  const levels = headingLevels(root);
  const problems: string[] = [];
  if (levels.length === 0) problems.push('no headings');
  if (levels[0] !== undefined && levels[0] !== 1) problems.push(`starts with h${levels[0]}, not h1`);
  levels.forEach((level, i) => {
    const previous = levels[i - 1];
    if (previous !== undefined && level > previous + 1) {
      problems.push(`h${level} follows h${previous} (heading ${i + 1} of ${levels.length})`);
    }
  });
  return problems;
}
