import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderLoadState } from './renderLoadState';

function renderResult(node: ReturnType<typeof renderLoadState>) {
  if (node === null) return null;
  return renderToStaticMarkup(<>{node}</>);
}

describe('renderLoadState', () => {
  test('returns skeleton loader for idle state', () => {
    const html = renderResult(renderLoadState({ status: 'idle' }, 'No data.'));
    expect(html).toContain('role="status"');
    expect(html).toContain('animate-pulse');
  });

  test('returns skeleton loader for loading state', () => {
    const html = renderResult(renderLoadState({ status: 'loading' }, 'No data.'));
    expect(html).toContain('role="status"');
    expect(html).toContain('animate-pulse');
  });

  test('returns error message for error state', () => {
    const html = renderResult(
      renderLoadState(
        {
          status: 'error',
          error: { status: 502, message: 'Service unavailable.', authRequired: false },
        },
        'No data.',
      ),
    );
    expect(html).toContain('Service unavailable.');
  });

  test('returns empty message when isEmpty is true', () => {
    const html = renderResult(
      renderLoadState({ status: 'success', data: [], isEmpty: true }, 'Nothing here.'),
    );
    expect(html).toContain('Nothing here.');
  });

  test('returns null for success with data', () => {
    const result = renderLoadState({ status: 'success', data: [1, 2], isEmpty: false }, 'No data.');
    expect(result).toBeNull();
  });
});
