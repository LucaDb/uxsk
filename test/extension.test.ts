import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { clearSelectedElement, startElementPicker, selectedElementInfo } from '../src/extension/picker.js';
import { renderManualReact } from '../src/generator/manual.js';
import { getClassNamespace, validateComponentName } from '../src/generator/naming.js';

describe('extension picker and manual generator', () => {
  it('lets the user select a node and starts the canvas editor', async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const html = await readFile(new URL('./fixtures/page.html', import.meta.url), 'utf8');
      await page.setContent(html);
      await page.evaluate(() => {
        Object.defineProperty(window, 'chrome', { configurable: true, value: {
          runtime: { sendMessage: (message: unknown) => { (window as Window & { __message?: unknown }).__message = message; return Promise.resolve(); } }
        } });
      });
      await page.evaluate(startElementPicker, 'PageSkeleton');
      await page.locator('section.card').dispatchEvent('pointerover', { bubbles: true, composed: true });
      await page.locator('section.card').dispatchEvent('click', { bubbles: true, cancelable: true, composed: true });

      const selected = await page.evaluate(selectedElementInfo);
      expect(selected).toMatchObject({ selected: true, tagName: 'section', childCount: 3 });
      expect(await page.locator('[data-ui-shell-picker]').count()).toBe(0);
      expect(await page.evaluate(() => (window as Window & { __message?: { type?: string } }).__message?.type)).toBe('ui-shell:start-editor');
      expect(await page.evaluate(selectedElementInfo)).toMatchObject({ selected: true });
      await page.evaluate(clearSelectedElement);
      expect(await page.evaluate(selectedElementInfo)).toMatchObject({ selected: false });
      expect(await page.locator('[data-ui-shell-picker]').count()).toBe(0);
    } finally {
      await browser.close();
    }
  });

  it('validates component names and creates distinct style namespaces', () => {
    expect(() => validateComponentName('page-skeleton')).toThrow();
    expect(() => validateComponentName('1Bad')).toThrow();
    expect(getClassNamespace('CardSkeleton', JSON.stringify({ one: true }))).toMatch(/^uisk-[0-9a-z]+$/);
    expect(getClassNamespace('CardSkeleton', 'layout-a')).not.toBe(getClassNamespace('CardSkeleton', 'layout-b'));
  });

  it('generates a responsive TSX component from manually drawn shapes', () => {
    const output = renderManualReact('ManualSkeleton', 400, 200, [
      { id: 'rect-a', kind: 'rect', x: 4, y: 8, width: 40, height: 20 },
      { id: 'circle-a', kind: 'circle', x: 100, y: 12, width: 32, height: 32 }
    ]);
    expect(output.tsx).toContain("gridColumn: '2 / span 10'");
    expect(output.tsx).toContain("gridRow: '3 / span 5'");
    expect(output.tsx).toContain('__circle');
    expect(output.css).toContain('aspect-ratio: 400 / 200');
    expect(output.css).toContain('display: grid');
    expect(output.css).not.toContain('position: absolute');
    expect(output.previewHtml).toContain('class=');
    expect(output.previewHtml).not.toContain('className=');
    expect(output.previewHtml).not.toContain('style={{');
    expect(output.previewHtml).toContain('grid-column:2 / span 10');
  });

  it('includes captured breakpoint layouts in the rendered component and preview', () => {
    const output = renderManualReact('ResponsiveSkeleton', 1200, 600, [
      { id: 'wide', kind: 'rect', x: 24, y: 20, width: 500, height: 80 }
    ], [{ viewportWidth: 720, width: 360, height: 700, shapes: [
      { id: 'narrow', kind: 'circle', x: 12, y: 20, width: 40, height: 40 }
    ] }]);
    expect(output.css).toContain('@media (max-width: 720px)');
    expect(output.tsx).toContain('__layout-bp-720-0');
    expect(output.previewHtml).toContain('__circle');
    expect(output.css).not.toContain('position: absolute');
  });
});
