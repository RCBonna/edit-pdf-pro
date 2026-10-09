import React from 'react';
import type { PageMeta } from '../types/pdf';
import { ChevronUp, ChevronDown, RotateCw, Trash2, Plus, File } from 'lucide-react';

interface PageSidebarProps {
  pages: PageMeta[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onMovePageUp: (index: number) => void;
  onMovePageDown: (index: number) => void;
  onRotatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onAddBlankPage: () => void;
}

export const PageSidebar: React.FC<PageSidebarProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onMovePageUp,
  onMovePageDown,
  onRotatePage,
  onDeletePage,
  onAddBlankPage,
}) => {
  return (
    <aside className="w-56 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col h-full select-none overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Páginas ({pages.length})
        </span>
        <button
          onClick={onAddBlankPage}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
          title="Adicionar Página Em Branco"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((page, index) => {
          const isSelected = index === currentPageIndex;
          return (
            <div
              key={page.pageIndex}
              onClick={() => onSelectPage(index)}
              className={`group relative rounded-xl border p-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-[1/1.4] w-full bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                <File className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  Página {index + 1}
                </span>
                
                {page.rotation > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-800 text-white text-[10px] rounded">
                    {page.rotation}°
                  </span>
                )}
              </div>

              {/* Action Toolbar on Hover/Select */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  #{index + 1}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePageUp(index);
                    }}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePageDown(index);
                    }}
                    disabled={index === pages.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(index);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Girar 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(index);
                    }}
                    disabled={pages.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    title="Excluir página"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
