import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function prerender() {
  const ssrPath = resolve('.vercel/output/functions/__server.func/_ssr/ssr.mjs');
  if (!existsSync(ssrPath)) {
    console.warn('[Prerender] SSR entry not found, skipping static index.html generation.');
    return;
  }
  try {
    const ssr = await import(pathToFileURL(ssrPath).href);
    const req = new Request('http://localhost:8080/');
    const res = await ssr.default.fetch(req);
    if (res.status === 200) {
      const html = await res.text();
      const outputPath = resolve('.vercel/output/static/index.html');
      writeFileSync(outputPath, html, 'utf-8');
      console.log('[Prerender] Successfully generated static desktop entry:', outputPath, `(${html.length} bytes)`);
    } else {
      console.error('[Prerender] Failed with status', res.status);
    }
  } catch (err) {
    console.error('[Prerender] Failed to prerender static entry:', err);
  }
}

prerender();
