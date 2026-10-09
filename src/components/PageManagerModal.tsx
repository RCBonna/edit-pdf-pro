import React from 'react';
import type { PageMeta } from '../types/pdf';
import { X, Layers, RotateCw, Trash2, ArrowLeft, ArrowRight, Plus } from 'lucide-react';

interface PageManagerModalProps {
  isOpen: boolean;
  pages: PageMeta[];
  pageOrder: number[];
  onClose: () => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onAddBlankPage: () => void;
}

export const PageManagerModal: React.FC<PageManagerModalProps> = ({
  isOpen,
  pages,
  pageOrder,
  onClose,
  onMovePage,
  onRotatePage,
  onDeletePage,
  onAddBlankPage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Gerenciador de Páginas do PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reordene, gire ou remova páginas do documento final.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onAddBlankPage}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Página</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid of Pages */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950">
          {pageOrder.map((pageIdx, orderPos) => {
            return (
              <div
                key={`${pageIdx}-${orderPos}`}
                className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Page Card */}
                <div className="aspect-[1/1.4] w-full bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-600">
                    {orderPos + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    (Pág. Orig. #{pageIdx + 1})
                  </span>
                </div>

                {/* Card Toolbar */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onMovePage(orderPos, orderPos - 1)}
                      disabled={orderPos === 0}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Mover para esquerda"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMovePage(orderPos, orderPos + 1)}
                      disabled={orderPos === pageOrder.length - 1}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Mover para direita"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onRotatePage(pageIdx)}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Girar página"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePage(orderPos)}
                      disabled={pageOrder.length <= 1}
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Excluir da sequência"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
