import fs from 'fs';
import { createCanvas } from 'canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function renderPdfToPng() {
  const pdfPath = 'C:/Users/rcbon/.gemini/antigravity-ide/brain/e6f1f512-6a01-47e1-aaa9-3a273507b063/NFS-e_136_Editada_11-04-2024.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({ canvasContext: context, viewport }).promise;

  const imageBuffer = canvas.toBuffer('image/png');
  const pngPath = 'C:/Users/rcbon/.gemini/antigravity-ide/brain/e6f1f512-6a01-47e1-aaa9-3a273507b063/preview_nfs_edited.png';
  fs.writeFileSync(pngPath, imageBuffer);

  console.log('Preview image generated:', pngPath);
}

renderPdfToPng().catch(console.error);
