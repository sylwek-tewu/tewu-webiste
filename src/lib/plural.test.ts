import { describe, it, expect } from 'vitest';
import { formatCount, pluralForm, singularOrPlural } from './plural';

const PYTANIE = { one: 'pytanie', few: 'pytania', many: 'pytań' };
const ZAPYTANNIA = { one: 'запитання', few: 'запитання', many: 'запитань' };

describe('pluralForm', () => {
  it.each([
    [1, 'one'], [2, 'few'], [4, 'few'], [5, 'many'], [11, 'many'], [12, 'many'], [21, 'many'], [22, 'few'],
  ] as const)('pl %i → %s', (n, form) => {
    expect(pluralForm('pl', n)).toBe(form);
  });

  it.each([
    [1, 'one'], [2, 'few'], [5, 'many'], [11, 'many'], [21, 'one'], [22, 'few'], [111, 'many'],
  ] as const)('uk %i → %s', (n, form) => {
    expect(pluralForm('uk', n)).toBe(form);
  });
});

describe('formatCount', () => {
  it('joins the number and the word', () => {
    expect(formatCount('pl', 11, PYTANIE)).toBe('11 pytań');
    expect(formatCount('pl', 3, PYTANIE)).toBe('3 pytania');
    expect(formatCount('uk', 5, ZAPYTANNIA)).toBe('5 запитань');
  });
});

describe('singularOrPlural', () => {
  it('takes the singular only for one', () => {
    const forms = { one: 'Źródło', many: 'Źródła' };
    expect(singularOrPlural(1, forms)).toBe('Źródło');
    expect(singularOrPlural(2, forms)).toBe('Źródła');
    expect(singularOrPlural(5, forms)).toBe('Źródła');
  });
});
