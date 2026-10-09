import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { ExtractedTextItem, PageMeta, PDFElement, ToolType } from '../types/pdf';
import { renderPageCanvas } from '../utils/pdfEngine';
import { getCssFontFamily } from '../utils/fontMapping';

interface PDFCanvasProps {
  pdfjsDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPageMeta: PageMeta | null;
  currentPageIndex: number;
  zoom: number;
  activeTool: ToolType;
  elements: PDFElement[];
  extractedText: ExtractedTextItem[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: PDFElement) => void;
  onUpdateElement: (element: PDFElement) => void;
  onDeleteElement: (id: string) => void;
  onZoomChange?: (newZoom: number) => void;
}

export const PDFCanvas: React.FC<PDFCanvasProps> = ({
  pdfjsDoc,
  currentPageMeta,
  currentPageIndex,
  zoom,
  activeTool,
  elements,
  extractedText,
  selectedElementId,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onZoomChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const pageElements = elements.filter((el) => el.pageIndex === currentPageIndex);

  useEffect(() => {
    if (pdfjsDoc && currentPageMeta && canvasRef.current) {
      renderPageCanvas(pdfjsDoc, currentPageIndex, canvasRef.current, zoom);
    }
  }, [pdfjsDoc, currentPageIndex, currentPageMeta, zoom]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (!onZoomChange) return;
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const nextZoom = Math.min(3.0, Math.max(0.4, +(zoom + delta).toFixed(2)));
      onZoomChange(nextZoom);
    }
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !currentPageMeta) return;

    const target = e.target as HTMLElement;
    if (target.closest('.pdf-element') || target.closest('.extracted-text-box')) {
      return;
    }

    onSelectElement(null);
    setEditingInlineId(null);

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    if (activeTool === 'text') {
      const newText: PDFElement = {
        id: `text-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'text',
        x: clickX,
        y: clickY,
        width: 180,
        height: 24,
        paddingY: 0,
        content: 'Digite seu texto aqui',
        fontFamily: 'Helvetica',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
      };
      onAddElement(newText);
      onSelectElement(newText.id);
      setEditingInlineId(newText.id);
    } else if (activeTool === 'form-text') {
      const newFormField: PDFElement = {
        id: `form-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'form-text',
        x: clickX,
        y: clickY,
        width: 160,
        height: 24,
        paddingY: 0,
        content: '',
        fieldName: `CampoTexto_${currentPageIndex + 1}_${Date.now().toString().slice(-4)}`,
        fontFamily: 'Helvetica',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        borderColor: '#2563eb',
        borderWidth: 1,
      };
      onAddElement(newFormField);
      onSelectElement(newFormField.id);
    } else if (activeTool === 'form-checkbox') {
      const newCb: PDFElement = {
        id: `cb-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'form-checkbox',
        x: clickX,
        y: clickY,
        width: 18,
        height: 18,
        content: 'true',
        fieldName: `CheckBox_${currentPageIndex + 1}_${Date.now().toString().slice(-4)}`,
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#2563eb',
        borderColor: '#2563eb',
        borderWidth: 1,
      };
      onAddElement(newCb);
      onSelectElement(newCb.id);
    } else if (activeTool === 'highlight') {
      const newHL: PDFElement = {
        id: `hl-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'highlight',
        x: clickX,
        y: clickY,
        width: 150,
        height: 18,
        content: '',
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#000000',
        backgroundColor: '#fde047',
        opacity: 0.4,
      };
      onAddElement(newHL);
      onSelectElement(newHL.id);
    } else if (activeTool === 'redact') {
      const newRedact: PDFElement = {
        id: `redact-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'redact',
        x: clickX,
        y: clickY,
        width: 140,
        height: 18,
        content: '',
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#000000',
        backgroundColor: '#000000',
      };
      onAddElement(newRedact);
      onSelectElement(newRedact.id);
    } else if (activeTool === 'rect') {
      const newRect: PDFElement = {
        id: `rect-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'rect',
        x: clickX,
        y: clickY,
        width: 160,
        height: 80,
        content: '',
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#000000',
        backgroundColor: '#e0e7ff',
        borderColor: '#3b82f6',
        borderWidth: 1,
      };
      onAddElement(newRect);
      onSelectElement(newRect.id);
    }
  };

  const handleConvertExtractedTextToEditable = (item: ExtractedTextItem) => {
    const existing = pageElements.find(
      (el) => el.isOriginalText && el.originalBoundingBox?.x === item.x && el.originalBoundingBox?.y === item.y
    );

    if (existing) {
      onSelectElement(existing.id);
      return;
    }

    const isBold = item.isBold;

    // Tight 0px vertical padding height matching line height perfectly
    const tightHeight = Math.max(item.fontSize, Math.round(item.height));

    const newEditableText: PDFElement = {
      id: `edit-orig-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'text',
      x: item.x,
      y: item.y,
      width: Math.max(item.width + 2, 40),
      height: tightHeight,
      paddingY: 0,
      content: item.text,
      fontFamily: isBold ? (item.fontFamilyMatch.includes('Times') ? 'Times-Bold' : 'Helvetica-Bold') : item.fontFamilyMatch,
      fontSize: item.fontSize,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: 'normal',
      color: item.color || '#000000',
      backgroundColor: '#ffffff',
      isOriginalText: true,
      originalText: item.text,
      originalFontName: item.fontName,
      originalBoundingBox: {
        x: item.x,
        y: item.y,
        width: item.width,
        height: tightHeight,
      },
    };

    onAddElement(newEditableText);
    onSelectElement(newEditableText.id);
    setEditingInlineId(newEditableText.id);
  };

  const handleMouseDown = (e: React.MouseEvent, element: PDFElement) => {
    if (activeTool === 'pan') return;
    e.stopPropagation();
    onSelectElement(element.id);

    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x,
      initialY: element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const deltaX = (e.clientX - dragState.startX) / zoom;
    const deltaY = (e.clientY - dragState.startY) / zoom;

    const el = pageElements.find((item) => item.id === dragState.elementId);
    if (el) {
      onUpdateElement({
        ...el,
        x: Math.max(0, dragState.initialX + deltaX),
        y: Math.max(0, dragState.initialY + deltaY),
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  if (!currentPageMeta) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        Carregando documento PDF...
      </div>
    );
  }

  const stageWidth = currentPageMeta.width * zoom;
  const stageHeight = currentPageMeta.height * zoom;

  return (
    <div
      onWheel={handleWheel}
      className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/60 dark:bg-slate-950/80 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={containerRef}
        onClick={handleStageClick}
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
        }}
        className="relative bg-white shadow-2xl rounded-sm transition-all select-none overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

        {/* Extracted Original PDF Text Boxes */}
        {extractedText.map((item) => {
          const isConverted = pageElements.some(
            (el) => el.isOriginalText && el.originalBoundingBox?.x === item.x && el.originalBoundingBox?.y === item.y
          );

          if (isConverted) return null;

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                handleConvertExtractedTextToEditable(item);
              }}
              style={{
                left: `${item.x * zoom}px`,
                top: `${item.y * zoom}px`,
                width: `${Math.max(item.width, 25) * zoom}px`,
                height: `${Math.max(item.fontSize, item.height) * zoom}px`,
              }}
              className="extracted-text-box absolute border border-transparent hover:border-blue-500 hover:bg-blue-500/15 cursor-pointer transition-all rounded-none z-10 group"
              title={`Clique para editar este texto (${item.text})`}
            >
              <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-0 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
                Editar ({item.fontFamilyMatch})
              </span>
            </div>
          );
        })}

        {/* Page Elements */}
        {pageElements.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isEditingInline = el.id === editingInlineId;
          const isBold = el.fontWeight === 'bold' || el.fontFamily.includes('Bold');
          const isItalic = el.fontStyle === 'italic' || el.fontFamily.includes('Oblique');
          const padY = (el.paddingY ?? 0) * zoom;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === 'text' || el.type === 'form-text') {
                  setEditingInlineId(el.id);
                }
              }}
              style={{
                left: `${el.x * zoom}px`,
                top: `${(el.y - (el.paddingY ?? 0)) * zoom}px`,
                width: `${el.width * zoom}px`,
                height: `${(el.height + (el.paddingY ?? 0) * 2) * zoom}px`,
                backgroundColor: el.backgroundColor === 'transparent' ? 'transparent' : (el.backgroundColor || '#ffffff'),
                borderColor: el.borderColor || (isSelected ? '#2563eb' : 'transparent'),
                borderWidth: `${(el.borderWidth || (isSelected ? 1.5 : 0)) * zoom}px`,
                opacity: el.opacity ?? 1,
              }}
              className={`pdf-element absolute flex items-center transition-all cursor-move z-20 ${
                isSelected
                  ? 'ring-2 ring-blue-500 shadow-sm'
                  : 'hover:ring-1 hover:ring-blue-300'
              }`}
            >
              {el.type === 'text' && (
                <div className="w-full h-full flex items-center px-0.5">
                  {isEditingInline ? (
                    <input
                      type="text"
                      autoFocus
                      value={el.content}
                      onChange={(e) => onUpdateElement({ ...el, content: e.target.value })}
                      onBlur={() => setEditingInlineId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingInlineId(null);
                      }}
                      style={{
                        fontFamily: getCssFontFamily(el.fontFamily),
                        fontSize: `${el.fontSize * zoom}px`,
                        fontWeight: isBold ? '700' : '400',
                        fontStyle: isItalic ? 'italic' : 'normal',
                        color: el.color,
                        textAlign: el.textAlign || 'left',
                        lineHeight: 1.0,
                      }}
                      className="w-full h-full bg-white border border-blue-500 rounded-none px-0.5 outline-none"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: getCssFontFamily(el.fontFamily),
                        fontSize: `${el.fontSize * zoom}px`,
                        fontWeight: isBold ? '700' : '400',
                        fontStyle: isItalic ? 'italic' : 'normal',
                        color: el.color,
                        textAlign: el.textAlign || 'left',
                        lineHeight: 1.0,
                      }}
                      className="w-full truncate leading-none"
                    >
                      {el.content}
                    </span>
                  )}
                </div>
              )}

              {el.type === 'form-text' && (
                <div className="w-full h-full flex items-center px-1 bg-white/90 border border-blue-500/80 rounded-none text-slate-800">
                  <input
                    type="text"
                    placeholder={el.fieldName || 'Campo de formulário'}
                    value={el.content}
                    onChange={(e) => onUpdateElement({ ...el, content: e.target.value })}
                    style={{
                      fontSize: `${el.fontSize * zoom}px`,
                      fontWeight: isBold ? '700' : '400',
                    }}
                    className="w-full bg-transparent outline-none text-slate-900 font-medium leading-none"
                  />
                </div>
              )}

              {el.type === 'form-checkbox' && (
                <div className="w-full h-full flex items-center justify-center border-2 border-blue-600 bg-white rounded-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={el.content === 'true'}
                    onChange={(e) => onUpdateElement({ ...el, content: e.target.checked ? 'true' : 'false' })}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                  />
                </div>
              )}

              {(el.type === 'signature' || el.type === 'image') && el.content && (
                <img
                  src={el.content}
                  alt="Assinatura/Imagem"
                  className="w-full h-full object-contain pointer-events-none"
                />
              )}

              {el.type === 'stamp' && (
                <div
                  style={{
                    fontSize: `${el.fontSize * zoom}px`,
                    color: el.color || '#dc2626',
                    borderColor: el.color || '#dc2626',
                  }}
                  className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center font-black uppercase tracking-widest bg-white/90 shadow-sm"
                >
                  {el.content}
                </div>
              )}

              {isSelected && (
                <>
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
