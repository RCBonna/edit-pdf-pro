import React from 'react';
import type { PDFElement, StandardFontFamily } from '../types/pdf';
import {
  Trash2,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Sliders,
  Move,
} from 'lucide-react';
import { getCssFontFamily } from '../utils/fontMapping';

interface PropertyPanelProps {
  selectedElement: PDFElement | null;
  onUpdateElement: (updated: PDFElement) => void;
  onDeleteElement: (id: string) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  if (!selectedElement) {
    return (
      <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-6 text-center select-none">
        <Sliders className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Nenhum elemento selecionado
        </span>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
          Clique em qualquer texto do PDF ou elemento para ajustar fonte, tamanho, cores e propriedades.
        </p>
      </aside>
    );
  }

  const fontFamilies: StandardFontFamily[] = [
    'Helvetica',
    'Helvetica-Bold',
    'Helvetica-Oblique',
    'Times-Roman',
    'Times-Bold',
    'Courier',
    'Courier-Bold',
    'Arial',
    'Georgia',
    'Verdana',
    'Trebuchet MS',
  ];

  return (
    <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none overflow-y-auto">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Propriedades
          </span>
        </div>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Excluir elemento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Original Font Detection Info Box if available */}
        {selectedElement.isOriginalText && (
          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fonte Detectada no PDF Original</span>
            </div>
            <p className="text-[11px] text-blue-900 dark:text-blue-200 font-medium">
              Fonte Original: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-[10px]">{selectedElement.originalFontName || 'Helvetica'}</code>
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
              As alterações serão renderizadas com a fonte correspondente no PDF final.
            </p>
          </div>
        )}

        {/* Text Content Editor */}
        {(selectedElement.type === 'text' || selectedElement.type === 'form-text') && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Conteúdo do Texto
            </label>
            <textarea
              rows={3}
              value={selectedElement.content}
              onChange={(e) => onUpdateElement({ ...selectedElement, content: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Font Family Picker */}
        {selectedElement.type === 'text' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Família da Fonte
            </label>
            <select
              value={selectedElement.fontFamily}
              onChange={(e) => onUpdateElement({ ...selectedElement, fontFamily: e.target.value as StandardFontFamily })}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{ fontFamily: getCssFontFamily(selectedElement.fontFamily) }}
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} style={{ fontFamily: getCssFontFamily(font) }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Font Size & Alignment */}
        {selectedElement.type === 'text' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tamanho (pt)
              </label>
              <input
                type="number"
                min={6}
                max={120}
                value={selectedElement.fontSize}
                onChange={(e) => onUpdateElement({ ...selectedElement, fontSize: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alinhamento
              </label>
              <div className="flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, textAlign: 'left' })}
                  className={`flex-1 p-1.5 flex justify-center ${
                    selectedElement.textAlign === 'left' || !selectedElement.textAlign
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, textAlign: 'center' })}
                  className={`flex-1 p-1.5 flex justify-center ${
                    selectedElement.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ ...selectedElement, textAlign: 'right' })}
                  className={`flex-1 p-1.5 flex justify-center ${
                    selectedElement.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Colors & Background */}
        <div className="grid grid-cols-2 gap-3">
          {/* Text/Border Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5" />
              <span>Cor Texto</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase">
                {selectedElement.color || '#000000'}
              </span>
            </div>
          </div>

          {/* Background / Whiteout fill color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fundo / Cobertura
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdateElement({ ...selectedElement, backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <button
                onClick={() => onUpdateElement({ ...selectedElement, backgroundColor: 'transparent' })}
                className="px-2 py-1 text-[10px] font-semibold border rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Transp.
              </button>
            </div>
          </div>
        </div>

        {/* Geometry & Coordinates */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <Move className="w-3.5 h-3.5" />
            <span>Posição & Dimensões</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400">X (pt):</span>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement({ ...selectedElement, x: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Y (pt):</span>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement({ ...selectedElement, y: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Largura (pt):</span>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement({ ...selectedElement, width: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Altura (pt):</span>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement({ ...selectedElement, height: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
