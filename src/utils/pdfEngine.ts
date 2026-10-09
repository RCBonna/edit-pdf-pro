import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ExtractedTextItem, PageMeta, PDFElement, PDFMetadata } from '../types/pdf';
import { normalizeFontName, isFontNameBold } from './fontMapping';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFLoadResult {
  pdfjsDoc: pdfjsLib.PDFDocumentProxy;
  pdfLibDoc: PDFDocument;
  pages: PageMeta[];
  extractedTextByPage: Record<number, ExtractedTextItem[]>;
  metadata: PDFMetadata;
}

/**
 * Load PDF data buffer and extract pages, metadata + text content using absolute matrix transforms
 */
export async function loadPDF(arrayBuffer: ArrayBuffer): Promise<PDFLoadResult> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdfjsDoc = await loadingTask.promise;

  const pdfLibDoc = await PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });

  const numPages = pdfjsDoc.numPages;
  const pages: PageMeta[] = [];
  const extractedTextByPage: Record<number, ExtractedTextItem[]> = {};

  const rawKeywords = pdfLibDoc.getKeywords();
  const keywordsString = Array.isArray(rawKeywords)
    ? rawKeywords.join(', ')
    : typeof rawKeywords === 'string'
    ? rawKeywords
    : '';

  // Extract Metadata from PDF
  const metadata: PDFMetadata = {
    title: pdfLibDoc.getTitle() || '',
    author: pdfLibDoc.getAuthor() || '',
    subject: pdfLibDoc.getSubject() || '',
    keywords: keywordsString,
    creator: pdfLibDoc.getCreator() || 'EditPDF Pro v1.0',
    producer: pdfLibDoc.getProducer() || 'pdf-lib (https://github.com/Hopding/pdf-lib)',
    creationDate: pdfLibDoc.getCreationDate()?.toISOString(),
    modificationDate: pdfLibDoc.getModificationDate()?.toISOString() || new Date().toISOString(),
  };

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
        // Transform item matrix by viewport matrix to get true absolute page coordinates (top-left origin)
        const pageTransform = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const absX = pageTransform[4];
        const absY = pageTransform[5]; // Baseline Y from top
        
        const fontSize = Math.round(Math.hypot(item.transform[0], item.transform[1]) || item.height || 12);
        // Exact topY of text bounding box with zero top padding
        const topY = Math.max(0, absY - fontSize);
        const fontName = item.fontName || 'Helvetica';
        const isBold = isFontNameBold(fontName);
        const fontNameMatch = normalizeFontName(fontName);

        textItems.push({
          id: `orig-text-${i - 1}-${itemIdx++}`,
          text: item.str,
          x: Math.max(0, absX),
          y: Math.max(0, topY),
          width: item.width > 0 ? item.width : item.str.length * (fontSize * 0.55),
          height: fontSize, // Exact line height (0px vertical padding for tight table rows)
          fontSize: fontSize,
          fontName: fontName,
          fontFamilyMatch: fontNameMatch,
          isBold: isBold,
          color: '#000000',
          transform: item.transform,
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
    metadata,
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
 * Export and save modified PDF document with metadata & all elements
 */
export async function saveModifiedPDF(
  originalPdfBuffer: ArrayBuffer,
  elements: PDFElement[],
  _pagesMeta: PageMeta[],
  pageOrder: number[],
  metadata?: PDFMetadata
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalPdfBuffer, { ignoreEncryption: true });
  const destDoc = await PDFDocument.create();

  // Apply Document Metadata
  if (metadata) {
    if (metadata.title) destDoc.setTitle(metadata.title);
    if (metadata.author) destDoc.setAuthor(metadata.author);
    if (metadata.subject) destDoc.setSubject(metadata.subject);
    if (metadata.keywords) {
      const kwList = metadata.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      destDoc.setKeywords(kwList);
    }
    if (metadata.creator) destDoc.setCreator(metadata.creator);
    if (metadata.producer) destDoc.setProducer(metadata.producer);

    if (metadata.creationDate) {
      const cDate = new Date(metadata.creationDate);
      if (!isNaN(cDate.getTime())) destDoc.setCreationDate(cDate);
    }
    if (metadata.modificationDate) {
      const mDate = new Date(metadata.modificationDate);
      if (!isNaN(mDate.getTime())) destDoc.setModificationDate(mDate);
    }
  }

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

      // 1. Cover original text box with solid whiteout background patch (ZERO VERTICAL PADDING to prevent overlapping lines above/below)
      if (el.isOriginalText && el.backgroundColor) {
        const origBox = el.originalBoundingBox;
        const useOrig = origBox && Math.abs(origBox.y - el.y) < 15 && Math.abs(origBox.x - el.x) < 20;

        const boxX = useOrig ? origBox.x : el.x;
        const boxY = useOrig ? origBox.y : el.y;
        const boxW = Math.max(el.width, useOrig ? origBox.width : 0);
        const boxH = Math.max(el.height, useOrig ? origBox.height : 0);

        const padY = el.paddingY ?? 0;
        const coverY = pageHeight - (boxY + padY) - boxH;

        currentPage.drawRectangle({
          x: Math.max(0, boxX - 1),
          y: Math.max(0, coverY),
          width: boxW + 2,
          height: boxH + (padY * 2),
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
        
        if (el.backgroundColor && el.backgroundColor !== 'transparent' && !el.isOriginalText) {
          currentPage.drawRectangle({
            x: el.x,
            y: pdfY,
            width: el.width,
            height: el.height,
            color: hexToRgb(el.backgroundColor),
          });
        }

        const textY = pdfY + (el.height * 0.15);

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
