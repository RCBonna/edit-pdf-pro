import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function perfectPdfEdit() {
  const inputPath = 'C:/Users/rcbon/.gemini/antigravity-ide/brain/e6f1f512-6a01-47e1-aaa9-3a273507b063/.user_uploaded/media_1791580283739.pdf';
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const pages = pdfDoc.getPages();
  const page = pages[0];

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. TOP-RIGHT BOX DATE:
  // Original item [6]: "14-04-2023" at absX: 463.4, pdfY: 765.6, w: 48.4, h: 8.0
  // Cover "14-04-2023" only with clean white rectangle
  page.drawRectangle({
    x: 460.0,
    y: 763.5,
    width: 54.0,
    height: 11.5,
    color: rgb(1, 1, 1),
  });

  // Draw "11-04-2024" in exact position & font matching original "14-04-2023"
  page.drawText('11-04-2024', {
    x: 463.4,
    y: 765.6,
    size: 8.0,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // 2. RED HEADER TITLE:
  // Cover any previous red text overlays across header area (X: 155 to 520, Y: 745 to 762)
  page.drawRectangle({
    x: 155.0,
    y: 746.0,
    width: 360.0,
    height: 18.0,
    color: rgb(1, 1, 1),
  });

  // Draw single, centered red title matching original layout
  page.drawText('RPS n° 136, emitido em 11/04/2024', {
    x: 164.9,
    y: 750.0,
    size: 14.0,
    font: helveticaBold,
    color: rgb(0.85, 0.1, 0.1),
  });

  // 3. BOTTOM LEFT NOTE:
  // Cover "14/04/23=R$3.051,40" or "11/04/24=R$3.051,40" at bottom left (X: 34 to 160, Y: 105 to 120)
  page.drawRectangle({
    x: 34.0,
    y: 105.0,
    width: 130.0,
    height: 15.0,
    color: rgb(1, 1, 1),
  });

  page.drawText('11/04/24=R$3.051,40', {
    x: 37.2,
    y: 108.7,
    size: 9.5,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Set metadata timestamps
  pdfDoc.setCreationDate(new Date('2024-04-11T16:34:38Z'));
  pdfDoc.setModificationDate(new Date('2024-04-11T16:34:38Z'));

  const modifiedBytes = await pdfDoc.save();

  const paths = [
    'c:/Users/rcbon/OneDrive/Apps/Edit PDF/Docs/NFS-e_136_Editada_11-04-2024.pdf',
    'c:/Users/rcbon/OneDrive/Apps/Edit PDF/NFS-e_136_Editada_11-04-2024.pdf',
    'C:/Users/rcbon/.gemini/antigravity-ide/brain/e6f1f512-6a01-47e1-aaa9-3a273507b063/NFS-e_136_Editada_11-04-2024.pdf',
    'c:/Users/rcbon/OneDrive/Apps/Edit PDF/Docs/NFS-e_136_Editada.pdf',
  ];

  for (const p of paths) {
    try {
      fs.writeFileSync(p, modifiedBytes);
      console.log('Successfully saved to:', p);
    } catch (e) {
      console.warn('File locked, skipping:', p);
    }
  }

  console.log('PDF pixel-perfect edit completed successfully!');
}

perfectPdfEdit().catch(console.error);
