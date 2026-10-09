export type ToolType =
  | 'select'
  | 'text'
  | 'form-text'
  | 'form-checkbox'
  | 'signature'
  | 'image'
  | 'rect'
  | 'circle'
  | 'line'
  | 'highlight'
  | 'redact'
  | 'stamp'
  | 'pan';

export type StandardFontFamily =
  | 'Helvetica'
  | 'Helvetica-Bold'
  | 'Helvetica-Oblique'
  | 'Times-Roman'
  | 'Times-Bold'
  | 'Courier'
  | 'Courier-Bold'
  | 'Arial'
  | 'Georgia'
  | 'Verdana'
  | 'Trebuchet MS';

export interface PDFElement {
  id: string;
  pageIndex: number;
  type: 'text' | 'form-text' | 'form-checkbox' | 'signature' | 'image' | 'rect' | 'circle' | 'line' | 'highlight' | 'redact' | 'stamp';
  
  // Geometry in PDF points (1 pt = 1/72 inch)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;

  // Content
  content: string; // Text string or base64 image data / stamp label
  fieldName?: string; // For form fields
  
  // Font styling
  fontFamily: StandardFontFamily | string;
  fontSize: number;
  color: string; // Hex e.g. #000000
  backgroundColor?: string; // Hex or 'transparent'
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;

  // Border styling
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;

  // Existing text overlay tracking
  isOriginalText?: boolean;
  originalText?: string;
  originalFontName?: string;
  originalBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedTextItem {
  id: string;
  text: string;
  x: number; // PDF coordinates (points)
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  fontFamilyMatch: StandardFontFamily;
  isBold: boolean;
  color: string;
  transform: number[];
}

export interface PageMeta {
  pageIndex: number;
  width: number;
  height: number;
  rotation: number;
  thumbnailUrl?: string;
}

export type StampType = 'APROVADO' | 'REJEITADO' | 'CONFIDENCIAL' | 'PAGO' | 'RASCUNHO' | 'COPIA';
