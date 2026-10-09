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
        height: 30,
        content: 'Digite seu texto aqui',
        fontFamily: 'Helvetica',
        fontSize: 14,
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
        height: 28,
        content: '',
        fieldName: `CampoTexto_${currentPageIndex + 1}_${Date.now().toString().slice(-4)}`,
        fontFamily: 'Helvetica',
        fontSize: 12,
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
        width: 20,
        height: 20,
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
        height: 20,
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
        height: 24,
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
        height: 100,
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

    const newEditableText: PDFElement = {
      id: `edit-orig-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'text',
      x: item.x,
      y: item.y,
      width: Math.max(item.width + 6, 60),
      height: item.height + 4,
      content: item.text,
      fontFamily: item.fontFamilyMatch,
      fontSize: item.fontSize,
      color: item.color || '#000000',
      backgroundColor: '#ffffff',
      isOriginalText: true,
      originalText: item.text,
      originalFontName: item.fontName,
      originalBoundingBox: {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
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
                width: `${Math.max(item.width, 30) * zoom}px`,
                height: `${item.height * zoom}px`,
              }}
              className="extracted-text-box absolute border border-transparent hover:border-blue-400 hover:bg-blue-500/10 cursor-pointer transition-all rounded-sm z-10 group"
              title={`Clique para editar este texto (Fonte: ${item.fontName || 'Helvetica'})`}
            >
              <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-0 text-[10px] bg-blue-600 text-white px-1 rounded pointer-events-none whitespace-nowrap shadow-sm">
                Editar Fonte Original ({item.fontFamilyMatch})
              </span>
            </div>
          );
        })}

        {pageElements.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isEditingInline = el.id === editingInlineId;

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
                top: `${el.y * zoom}px`,
                width: `${el.width * zoom}px`,
                height: `${el.height * zoom}px`,
                backgroundColor: el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor || 'transparent',
                borderColor: el.borderColor || (isSelected ? '#2563eb' : 'transparent'),
                borderWidth: `${(el.borderWidth || (isSelected ? 1.5 : 0)) * zoom}px`,
                opacity: el.opacity ?? 1,
              }}
              className={`pdf-element absolute flex items-center transition-all cursor-move z-20 ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md'
                  : 'hover:ring-1 hover:ring-blue-300'
              }`}
            >
              {el.type === 'text' && (
                <div className="w-full h-full flex items-center px-1">
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
                        color: el.color,
                        textAlign: el.textAlign || 'left',
                      }}
                      className="w-full h-full bg-white border border-blue-500 rounded px-1 outline-none font-sans"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: getCssFontFamily(el.fontFamily),
                        fontSize: `${el.fontSize * zoom}px`,
                        color: el.color,
                        textAlign: el.textAlign || 'left',
                        lineHeight: 1.1,
                      }}
                      className="w-full truncate font-sans"
                    >
                      {el.content}
                    </span>
                  )}
                </div>
              )}

              {el.type === 'form-text' && (
                <div className="w-full h-full flex items-center px-2 bg-white/80 border border-blue-500/80 rounded text-slate-800">
                  <input
                    type="text"
                    placeholder={el.fieldName || 'Campo de formulário'}
                    value={el.content}
                    onChange={(e) => onUpdateElement({ ...el, content: e.target.value })}
                    style={{ fontSize: `${el.fontSize * zoom}px` }}
                    className="w-full bg-transparent outline-none text-slate-900 font-medium"
                  />
                </div>
              )}

              {el.type === 'form-checkbox' && (
                <div className="w-full h-full flex items-center justify-center border-2 border-blue-600 bg-white rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={el.content === 'true'}
                    onChange={(e) => onUpdateElement({ ...el, content: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
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
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
