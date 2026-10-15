import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * ADR 0002: every page loads only its own language's dictionary. Client components are shared by
 * both sites, so only the two locale providers may import a dictionary; everything else reads it
 * from the provider. Walks the static import graph, because a bundle check needs a full build.
 */

const SRC = path.resolve(import.meta.dirname, '..');
const DICTIONARIES = ['i18n/pl.ts', 'i18n/uk.ts'].map((file) => path.join(SRC, file));
const PROVIDERS = ['i18n/PlLocaleProvider.tsx', 'i18n/UkLocaleProvider.tsx'].map((file) => path.join(SRC, file));

// Runtime imports and re-exports; `import type` / `export type` are erased and never bundled.
const IMPORT_PATTERN = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;

function resolveImport(fromFile: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) base = path.join(SRC, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null; // a package
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null;
}

function runtimeImports(file: string): string[] {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(IMPORT_PATTERN)]
    .filter(([, typeOnly]) => !typeOnly)
    .map(([, , specifier]) => resolveImport(file, specifier))
    .filter((resolved): resolved is string => resolved !== null);
}

/** The import chain from `entry` to the first of `targets` it reaches, or null. */
function chainTo(entry: string, targets: string[]): string[] | null {
  const parent = new Map<string, string | null>([[entry, null]]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (targets.includes(file)) {
      const chain: string[] = [];
      for (let step: string | null = file; step; step = parent.get(step) ?? null) {
        chain.unshift(path.relative(SRC, step));
      }
      return chain;
    }
    for (const next of runtimeImports(file)) {
      if (!parent.has(next)) {
        parent.set(next, file);
        queue.push(next);
      }
    }
  }
  return null;
}

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const clientModules = sourceFiles(SRC).filter((file) =>
  /^\s*(?:\/\/[^\n]*\n\s*)*['"]use client['"]/.test(fs.readFileSync(file, 'utf8'))
);

// The copy of the service pages and the FAQ page (ADR 0004 §2, ADR 0005): server pages read it and
// pass one page's copy as props. Only the type modules may be imported (type-only) by client code.
const PAGE_CONTENT = sourceFiles(path.join(SRC, 'content')).filter((file) => path.basename(file) !== 'types.ts');

const leaksTo = (targets: string[], allowed: string[] = []) =>
  clientModules
    .filter((file) => !allowed.includes(file))
    .map((file) => chainTo(file, targets))
    .filter((chain): chain is string[] => chain !== null)
    .map((chain) => chain.join(' -> '));

describe('client bundles (ADR 0002)', () => {
  it('finds the client modules to check', () => {
    expect(clientModules).toEqual(expect.arrayContaining(PROVIDERS));
    expect(clientModules.length).toBeGreaterThan(PROVIDERS.length);
  });

  it('import a dictionary only through the locale providers', () => {
    expect(leaksTo(DICTIONARIES, PROVIDERS)).toEqual([]);
  });

  it('never import the page content modules, only receive one page as props', () => {
    expect(PAGE_CONTENT).toEqual(expect.arrayContaining([path.join(SRC, 'content/faq/pl.ts'), path.join(SRC, 'content/service-pages/index.ts')]));
    expect(leaksTo(PAGE_CONTENT)).toEqual([]);
  });
});
