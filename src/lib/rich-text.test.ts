import { describe, it, expect } from 'vitest';
import { isExternalHref, parseRichText, richTextToHtml } from './rich-text';

describe('parseRichText', () => {
  it('splits text, links and bold phrases in order', () => {
    expect(parseRichText('Zobacz [KPiR](/uslugi/kpir) i **ryczałt**.')).toEqual([
      { kind: 'text', text: 'Zobacz ' },
      { kind: 'link', text: 'KPiR', href: '/uslugi/kpir' },
      { kind: 'text', text: ' i ' },
      { kind: 'strong', text: 'ryczałt' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('returns plain text as one segment', () => {
    expect(parseRichText('Tak.')).toEqual([{ kind: 'text', text: 'Tak.' }]);
  });

  it('leaves broken markup as text, so a content test can find it', () => {
    expect(parseRichText('[KPiR](/uslugi/kpir')).toEqual([{ kind: 'text', text: '[KPiR](/uslugi/kpir' }]);
  });
});

describe('isExternalHref', () => {
  it('tells site paths from external addresses', () => {
    expect(isExternalHref('https://www.biznes.gov.pl/pl/portal/00285')).toBe(true);
    expect(isExternalHref('/uslugi/kpir')).toBe(false);
  });
});

describe('richTextToHtml', () => {
  it('makes site links absolute and keeps external ones', () => {
    expect(richTextToHtml('[Certyfikaty](/certyfikaty), [ZUS](https://www.zus.pl/)', 'https://tewu.szczecin.pl')).toBe(
      '<a href="https://tewu.szczecin.pl/certyfikaty">Certyfikaty</a>, <a href="https://www.zus.pl/">ZUS</a>'
    );
  });

  it('escapes &, <, > and quotes', () => {
    expect(richTextToHtml('A & B <i> "C" **x<y**', 'https://tewu.szczecin.pl')).toBe(
      'A &amp; B &lt;i&gt; &quot;C&quot; <strong>x&lt;y</strong>'
    );
  });
});
