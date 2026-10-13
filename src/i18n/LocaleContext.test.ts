import { describe, it, expect } from 'vitest';
import { localizePath } from './LocaleContext';

describe('localizePath', () => {
  it.each([
    ['/', 'uk', '/uk'],
    ['/kontakt', 'uk', '/uk/kontakt'],
    ['/uk', 'pl', '/'],
    ['/uk/kontakt', 'pl', '/kontakt'],
    ['/uk/kontakt', 'uk', '/uk/kontakt'],
    ['/kontakt', 'pl', '/kontakt'],
    // Only a whole "/uk" segment marks a Ukrainian path
    ['/ukryte', 'uk', '/uk/ukryte'],
    ['/ukryte', 'pl', '/ukryte'],
  ] as const)('%s -> %s is %s', (path, target, expected) => {
    expect(localizePath(path, target)).toBe(expected);
  });
});
