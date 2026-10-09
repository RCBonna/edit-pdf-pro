import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ExtractedTextItem, PageMeta, PDFElement } from '../types/pdf';
import { normalizeFontName, isFontNameBold } from './fontMapping';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFLoadResult {
  pdfjsDoc: pdfjsLib.PDFDocumentProxy;
  pdfLibDoc: PDFDocument;
  pages: PageMeta[];
  extractedTextByPage: Record<number, ExtractedTextItem[]>;
}

/**
 * Load PDF data buffer and extract pages + text content with precise font and geometry detection
 */
export async function loadPDF(arrayBuffer: ArrayBuffer): Promise<PDFLoadResult> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdfjsDoc = await loadingTask.promise;

  const pdfLibDoc = await PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });

  const numPages = pdfjsDoc.numPages;
  const pages: PageMeta[] = [];
  const extractedTextByPage: Record<number, ExtractedTextItem[]> = {};

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfjsDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });

    pages.push({
      pageIndex: i - 1,
      width: viewport.width,
      height: viewport.height,
      rotation: viewport.rotation || 0,
    });

    const textContent = await page.getTextContent();
    const textItems: ExtractedTextItem[] = [];

    let itemIdx = 0;
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
        const tx = transform[4];
        const ty = transform[5];
        
        const fontSize = Math.round(Math.hypot(transform[0], transform[1]) || item.height || 12);
        const pdfY = viewport.height - ty - fontSize;
        const fontName = item.fontName || 'Helvetica';
        const isBold = isFontNameBold(fontName);
        const fontNameMatch = normalizeFontName(fontName);

        textItems.push({
          id: `orig-text-${i - 1}-${itemIdx++}`,
          text: item.str,
          x: Math.max(0, tx),
          y: Math.max(0, pdfY),
          width: item.width > 0 ? item.width : item.str.length * (fontSize * 0.55),
          height: item.height || fontSize * 1.2,
          fontSize: fontSize,
          fontName: fontName,
          fontFamilyMatch: fontNameMatch,
          isBold: isBold,
          color: '#000000',
          transform: transform,
        });
      }
    }

    extractedTextByPage[i - 1] = textItems;
  }

  return {
    pdfjsDoc,
    pdfLibDoc,
    pages,
    extractedTextByPage,
  };
}

/**
 * Render a single page onto an HTML canvas
 */
export async function renderPageCanvas(
  pdfjsDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.0
): Promise<void> {
  const page = await pdfjsDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
}

/**
 * Export and save modified PDF document with all new & modified elements
 */
export async function saveModifiedPDF(
  originalPdfBuffer: ArrayBuffer,
  elements: PDFElement[],
  _pagesMeta: PageMeta[],
  pageOrder: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalPdfBuffer, { ignoreEncryption: true });
  const destDoc = await PDFDocument.create();

  const fonts = {
    'Helvetica': await destDoc.embedFont(StandardFonts.Helvetica),
    'Helvetica-Bold': await destDoc.embedFont(StandardFonts.HelveticaBold),
    'Helvetica-Oblique': await destDoc.embedFont(StandardFonts.HelveticaOblique),
    'Times-Roman': await destDoc.embedFont(StandardFonts.TimesRoman),
    'Times-Bold': await destDoc.embedFont(StandardFonts.TimesRomanBold),
    'Courier': await destDoc.embedFont(StandardFonts.Courier),
    'Courier-Bold': await destDoc.embedFont(StandardFonts.CourierBold),
    'Arial': await destDoc.embedFont(StandardFonts.Helvetica),
    'Georgia': await destDoc.embedFont(StandardFonts.TimesRoman),
    'Verdana': await destDoc.embedFont(StandardFonts.Helvetica),
    'Trebuchet MS': await destDoc.embedFont(StandardFonts.Helvetica),
  };

  for (let destIndex = 0; destIndex < pageOrder.length; destIndex++) {
    const srcIndex = pageOrder[destIndex];

    if (srcIndex < srcDoc.getPageCount()) {
      const [copiedPage] = await destDoc.copyPages(srcDoc, [srcIndex]);
      destDoc.addPage(copiedPage);
    } else {
      destDoc.addPage([595.28, 841.89]);
    }

    const currentPage = destDoc.getPage(destIndex);
    const { height: pageHeight } = currentPage.getSize();

    const pageElements = elements.filter(
      (el) => el.pageIndex === srcIndex || el.pageIndex === destIndex
    );

    for (const el of pageElements) {
      const pdfY = pageHeight - el.y - el.height;

      // 1. Cover original text box with solid whiteout background patch
      if (el.isOriginalText && el.backgroundColor) {
        const origBox = el.originalBoundingBox || { x: el.x, y: el.y, width: el.width, height: el.height };
        const coverY = pageHeight - origBox.y - origBox.height;

        currentPage.drawRectangle({
          x: Math.max(0, origBox.x - 3),
          y: coverY - 2,
          width: origBox.width + 6,
          height: origBox.height + 4,
          color: hexToRgb(el.backgroundColor || '#ffffff'),
        });
      }

      // 2. Render Text / Modified Text
      if (el.type === 'text' && el.content.trim().length > 0) {
        let selectedFontKey = el.fontFamily;
        if (el.fontWeight === 'bold' && !selectedFontKey.includes('Bold')) {
          if (selectedFontKey.includes('Times')) selectedFontKey = 'Times-Bold';
          else if (selectedFontKey.includes('Courier')) selectedFontKey = 'Courier-Bold';
          else selectedFontKey = 'Helvetica-Bold';
        }

        const selectedFont = fonts[selectedFontKey as keyof typeof fonts] || fonts['Helvetica'];
        
        // Fill custom background if requested
        if (el.backgroundColor && el.backgroundColor !== 'transparent' && !el.isOriginalText) {
          currentPage.drawRectangle({
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            color: hexToRgb(el.backgroundColor),
          });
        }

        const textY = pdfY + (el.height * 0.2);

        currentPage.drawText(el.content, {
          x: el.x,
          y: textY,
          size: el.fontSize,
          font: selectedFont,
          color: hexToRgb(el.color),
        });
      }

      // 3. Form Text Input Field
      if (el.type === 'form-text') {
        const form = destDoc.getForm();
        const fieldName = el.fieldName || `TextField_${destIndex}_${el.id}`;
        
        try {
          const textField = form.createTextField(fieldName);
          textField.setText(el.content || '');
          textField.addToPage(currentPage, {
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            borderColor: hexToRgb(el.borderColor || '#2563eb'),
            borderWidth: el.borderWidth || 1,
            backgroundColor: hexToRgb(el.backgroundColor || '#ffffff'),
          });
        } catch {
          currentPage.drawRectangle({
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            color: hexToRgb(el.backgroundColor || '#ffffff'),
            borderColor: hexToRgb(el.borderColor || '#2563eb'),
            borderWidth: el.borderWidth || 1,
          });
          currentPage.drawText(el.content, {
            x: el.x + 5,
            y: pdfY + 5,
            size: el.fontSize,
            font: fonts['Helvetica'],
            color: hexToRgb(el.color),
          });
        }
      }

      // 4. Form Checkbox
      if (el.type === 'form-checkbox') {
        const form = destDoc.getForm();
        const cbName = el.fieldName || `CheckBox_${destIndex}_${el.id}`;
        try {
          const checkBox = form.createCheckBox(cbName);
          if (el.content === 'true' || el.content === 'checked') {
            checkBox.check();
          }
          checkBox.addToPage(currentPage, {
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            borderColor: hexToRgb(el.borderColor || '#2563eb'),
            borderWidth: 1,
          });
        } catch {
          currentPage.drawRectangle({
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            borderColor: hexToRgb('#2563eb'),
            borderWidth: 1,
          });
        }
      }

      // 5. Signature / Image
      if ((el.type === 'signature' || el.type === 'image') && el.content.startsWith('data:image')) {
        try {
          const imageBytes = base64ToUint8Array(el.content);
          let embeddedImage;
          if (el.content.includes('data:image/png')) {
            embeddedImage = await destDoc.embedPng(imageBytes);
          } else {
            embeddedImage = await destDoc.embedJpg(imageBytes);
          }

          currentPage.drawImage(embeddedImage, {
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
          });
        } catch (err) {
          console.error('Failed to embed image:', err);
        }
      }

      // 6. Shapes, Highlights & Redactions
      if (el.type === 'rect' || el.type === 'highlight' || el.type === 'redact') {
        currentPage.drawRectangle({
          x: el.x,
          y: pdfY,
          width: el.width,
          height: el.height,
          color: hexToRgb(el.backgroundColor || (el.type === 'redact' ? '#000000' : el.type === 'highlight' ? '#fde047' : '#e0e7ff')),
          opacity: el.opacity ?? (el.type === 'highlight' ? 0.4 : 1.0),
          borderColor: el.borderColor ? hexToRgb(el.borderColor) : undefined,
          borderWidth: el.borderWidth || 0,
        });
      }

      // 7. Stamp
      if (el.type === 'stamp') {
        currentPage.drawRectangle({
          x: el.x,
          y: pdfY,
          width: el.width,
          height: el.height,
          color: hexToRgb('#ffffff'),
          borderColor: hexToRgb(el.color || '#dc2626'),
          borderWidth: 2,
        });

        currentPage.drawText(el.content, {
          x: el.x + 10,
          y: pdfY + (el.height / 2) - (el.fontSize / 3),
          size: el.fontSize,
          font: fonts['Helvetica-Bold'],
          color: hexToRgb(el.color || '#dc2626'),
        });
      }
    }
  }

  return await destDoc.save();
}

function hexToRgb(hexColor: string) {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16) || 0;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const base64Data = base64.split(',')[1] || base64;
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
