import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderLoadState } from './renderLoadState';

function renderResult(node: ReturnType<typeof renderLoadState>) {
  if (node === null) return null;
  return renderToStaticMarkup(<>{node}</>);
}

describe('renderLoadState', () => {
  test('returns skeleton loader for pending state', () => {
    const html = renderResult(
      renderLoadState({ status: 'pending', data: undefined, error: null }, 'No data.', () => false),
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('animate-pulse');
  });

  test('returns error message for error state', () => {
    const html = renderResult(
      renderLoadState(
        {
          status: 'error',
          data: undefined,
          error: new Error('Service unavailable.'),
        },
        'No data.',
        () => false,
      ),
    );
    expect(html).toContain('Service unavailable.');
  });

  test('returns empty message when isEmpty returns true', () => {
    const html = renderResult(
      renderLoadState(
        { status: 'success', data: [] as number[], error: null },
        'Nothing here.',
        (data) => data.length === 0,
      ),
    );
    expect(html).toContain('Nothing here.');
  });

  test('returns null for success with data', () => {
    const result = renderLoadState(
      { status: 'success', data: [1, 2], error: null },
      'No data.',
      (data) => data.length === 0,
    );
    expect(result).toBeNull();
  });
});
