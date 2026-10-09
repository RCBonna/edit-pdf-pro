import type { StandardFontFamily } from '../types/pdf';

/**
 * Maps raw font names extracted by PDF.js to standard PDF font families
 */
export function normalizeFontName(rawFontName: string): StandardFontFamily {
  const font = (rawFontName || '').toLowerCase();

  if (font.includes('times') || font.includes('serif') || font.includes('georgia')) {
    if (font.includes('bold')) {
      return 'Times-Bold';
    }
    return 'Times-Roman';
  }

  if (font.includes('courier') || font.includes('mono') || font.includes('code') || font.includes('typewriter')) {
    if (font.includes('bold')) {
      return 'Courier-Bold';
    }
    return 'Courier';
  }

  if (font.includes('arial') || font.includes('helvetica') || font.includes('sans') || font.includes('verdana') || font.includes('trebuchet')) {
    if (font.includes('bold')) {
      return 'Helvetica-Bold';
    }
    if (font.includes('oblique') || font.includes('italic')) {
      return 'Helvetica-Oblique';
    }
    return 'Helvetica';
  }

  return 'Helvetica';
}

/**
 * Returns CSS font-family stack for screen rendering based on PDF font family
 */
export function getCssFontFamily(fontFamily: string): string {
  switch (fontFamily) {
    case 'Times-Roman':
    case 'Times-Bold':
    case 'Georgia':
      return '"Times New Roman", Times, Georgia, serif';
    case 'Courier':
    case 'Courier-Bold':
      return '"Courier New", Courier, monospace';
    case 'Helvetica':
    case 'Helvetica-Bold':
    case 'Helvetica-Oblique':
    case 'Arial':
      return 'Arial, Helvetica, "Liberation Sans", sans-serif';
    case 'Verdana':
      return 'Verdana, Geneva, sans-serif';
    case 'Trebuchet MS':
      return '"Trebuchet MS", "Lucida Sans Unicode", sans-serif';
    default:
      return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}
