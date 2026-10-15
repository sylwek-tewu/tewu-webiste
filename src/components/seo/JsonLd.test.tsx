// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd, serializeJsonLd } from './JsonLd';

describe('JsonLd', () => {
  it('renders one application/ld+json script with the data', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Thing', name: 'TEWU' }} />);
    const html = container.innerHTML;
    expect(html).toBe('<script type="application/ld+json">{"@type":"Thing","name":"TEWU"}</script>');
  });

  it('escapes < so page copy cannot close the script element', () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const { container } = render(<JsonLd data={data} />);
    const html = container.innerHTML;
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain('\\u003c/script>');
    // Still the same data once parsed
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
