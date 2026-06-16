import { sanitizeMiaRenderedHtml } from './more-info-advanced-control.handler';

describe('sanitizeMiaRenderedHtml', () => {
  it('keeps iframe tags for MIA rendered html', () => {
    const html = '<p>before</p><iframe src="https://example.org/doc.pdf" width="100%" height="360" title="PDF"></iframe><p>after</p>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<iframe');
    expect(sanitized).toContain('src="https://example.org/doc.pdf"');
    expect(sanitized).toContain('width="100%"');
    expect(sanitized).toContain('height="360"');
  });

  it('removes unsafe script tags from MIA rendered html', () => {
    const html = '<p>safe</p><script>alert(1)</script>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<p>safe</p>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('keeps MIA export attributes needed for download buttons', () => {
    const html = '<div data-mia-export-template="true" data-mia-template-task-id="201"><p>Plantilla</p></div>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('data-mia-export-template="true"');
    expect(sanitized).toContain('data-mia-template-task-id="201"');
  });
});
