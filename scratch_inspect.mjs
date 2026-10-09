import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function inspectText() {
  const pdfPath = 'C:/Users/rcbon/.gemini/antigravity-ide/brain/e6f1f512-6a01-47e1-aaa9-3a273507b063/.user_uploaded/media_1791580283739.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });

  const textContent = await page.getTextContent();
  console.log('--- EXTRACTED TEXT ITEMS ---');
  textContent.items.forEach((item, idx) => {
    if ('str' in item && item.str.trim()) {
      const pageTransform = pdfjs.Util.transform(viewport.transform, item.transform);
      const absX = pageTransform[4];
      const absY = pageTransform[5]; // Baseline Y from top
      const pdfY = viewport.height - absY; // Baseline Y from bottom (PDF space)
      console.log(`[${idx}] "${item.str}" | absX: ${absX.toFixed(1)}, pdfY: ${pdfY.toFixed(1)}, w: ${item.width.toFixed(1)}, h: ${item.height.toFixed(1)}, font: ${item.fontName}`);
    }
  });
}

inspectText().catch(console.error);
