import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { StatusLabel } from './StatusLabel';

describe('StatusLabel', () => {
  test('renders with active tone', () => {
    const html = renderToStaticMarkup(<StatusLabel label='Active' tone='active' />);
    expect(html).toContain('Active');
    expect(html).toContain('emerald');
  });

  test('renders with inactive tone', () => {
    const html = renderToStaticMarkup(<StatusLabel label='Inactive' tone='inactive' />);
    expect(html).toContain('Inactive');
    expect(html).toContain('zinc');
  });

  test('renders with neutral tone by default', () => {
    const html = renderToStaticMarkup(<StatusLabel label='Unknown' />);
    expect(html).toContain('Unknown');
    expect(html).toContain('muted');
  });

  test('renders explicit neutral tone', () => {
    const html = renderToStaticMarkup(<StatusLabel label='Pending' tone='neutral' />);
    expect(html).toContain('Pending');
    expect(html).toContain('muted');
  });
});
