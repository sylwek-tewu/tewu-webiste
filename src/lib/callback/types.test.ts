import { describe, expect, it } from 'vitest';
import { CALLBACK_TOPICS, getSourceLabel } from './types';

describe('getSourceLabel', () => {
  it('labels the FAQ page button for the office', () => {
    expect(getSourceLabel('faq')).toBe('Przycisk „Bezpłatna wycena – oddzwonimy” na stronie FAQ');
  });
});

describe('CALLBACK_TOPICS', () => {
  it('offers exactly these topics, in this order (foundations are not a target group)', () => {
    expect(CALLBACK_TOPICS.map((topic) => topic.id)).toEqual(['spolka', 'dzialalnosc', 'kadry-place', 'inne']);
    expect(CALLBACK_TOPICS.map((topic) => topic.label)).toEqual([
      'Spółka z o.o. / partnerska / komandytowa',
      'Jednoosobowa działalność gospodarcza (JDG)',
      'Kadry i płace',
      'Inne zapytanie',
    ]);
  });
});
