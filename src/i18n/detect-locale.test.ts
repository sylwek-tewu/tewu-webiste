import { describe, it, expect } from 'vitest';
import { detectLocaleFromAcceptLanguage } from './detect-locale';

describe('detectLocaleFromAcceptLanguage', () => {
  it('defaults to pl when header is empty, null or undefined', () => {
    expect(detectLocaleFromAcceptLanguage(null)).toBe('pl');
    expect(detectLocaleFromAcceptLanguage(undefined)).toBe('pl');
    expect(detectLocaleFromAcceptLanguage('')).toBe('pl');
  });

  it('detects Ukrainian primary language', () => {
    expect(detectLocaleFromAcceptLanguage('uk-UA,uk;q=0.9,en;q=0.8')).toBe('uk');
    expect(detectLocaleFromAcceptLanguage('uk')).toBe('uk');
  });

  it('detects Russian language and routes to Ukrainian', () => {
    expect(detectLocaleFromAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8')).toBe('uk');
    expect(detectLocaleFromAcceptLanguage('ru')).toBe('uk');
  });

  it('prefers Polish when Polish has higher quality value', () => {
    expect(detectLocaleFromAcceptLanguage('pl-PL,pl;q=0.9,uk;q=0.5')).toBe('pl');
  });

  it('prefers Ukrainian when Ukrainian has higher quality value than Polish', () => {
    expect(detectLocaleFromAcceptLanguage('uk-UA,uk;q=0.9,pl;q=0.5')).toBe('uk');
    expect(detectLocaleFromAcceptLanguage('ru;q=0.9,pl;q=0.4')).toBe('uk');
  });

  it('defaults to pl for other languages (e.g. en, de, fr)', () => {
    expect(detectLocaleFromAcceptLanguage('en-US,en;q=0.9')).toBe('pl');
    expect(detectLocaleFromAcceptLanguage('de-DE,de;q=0.9')).toBe('pl');
  });
});
