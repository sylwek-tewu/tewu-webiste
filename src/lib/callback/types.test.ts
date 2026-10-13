import { describe, expect, it } from 'vitest';
import { CALLBACK_TOPICS } from './types';

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
