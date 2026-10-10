import React from 'react';
import {
  FileText,
  Upload,
  Download,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  FilePlus,
  Moon,
  Sun,
  Maximize2,
  Info,
  History,
} from 'lucide-react';
import { APP_VERSION } from '../utils/version';

interface HeaderProps {
  fileName: string;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFileUpload: (file: File) => void;
  onLoadSample: (type: 'contract' | 'invoice') => void;
  onSavePDF: () => void;
  onOpenPageManager: () => void;
  onOpenMetadataModal: () => void;
  onOpenRecentFiles: () => void;
  recentCount: number;
  isSaving: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFileUpload,
  onLoadSample,
  onSavePDF,
  onOpenPageManager,
  onOpenMetadataModal,
  onOpenRecentFiles,
  recentCount,
  isSaving,
  darkMode,
  onToggleDarkMode,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const zoomPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5];

  return (
    <header className="app-header flex items-center justify-between px-4 py-2.5 border-b shadow-sm select-none">
      {/* Left section: App Brand & System Version & Document Title */}
      <div className="flex items-center space-x-3">
        <div className="brand-badge flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md">
          <FileText className="w-4 h-4" />
          <span>EditPDF Pro</span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full font-normal">
            v{APP_VERSION}
          </span>
        </div>

        <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        <div className="flex items-center space-x-2 max-w-xs sm:max-w-md truncate">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={fileName}>
            {fileName || 'Documento Sem Nome.pdf'}
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-icon-subtle p-1 rounded-md text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
            title="Trocar arquivo PDF"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenMetadataModal}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Informações de edição e metadados do documento"
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Info & Metadados</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
        </div>
      </div>

      {/* Center Section: Undo/Redo & Zoom Controls */}
      <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-icon p-1.5 rounded-lg disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Desfazer (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="btn-icon p-1.5 rounded-lg disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Refazer (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          onClick={onZoomOut}
          className="btn-icon p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Reduzir zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <input
          type="range"
          min="0.4"
          max="2.5"
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-20 accent-blue-600 cursor-pointer hidden sm:block"
          title="Ajustar nível de zoom"
        />

        <select
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
        >
          {zoomPresets.map((preset) => (
            <option key={preset} value={preset}>
              {Math.round(preset * 100)}%
            </option>
          ))}
        </select>

        <button
          onClick={onZoomIn}
          className="btn-icon p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomReset}
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
          title="Ajustar 100%"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          onClick={onOpenPageManager}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Gerenciar páginas"
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Páginas</span>
        </button>
      </div>

      {/* Right Section: Recent Files, Theme Toggle & Download Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenRecentFiles}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors relative"
          title="Ver histórico dos 10 últimos arquivos recentes"
        >
          <History className="w-3.5 h-3.5 text-blue-500" />
          <span>Recentes</span>
          {recentCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              {recentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Abrir PDF</span>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onSavePDF}
          disabled={isSaving}
          className="btn-primary flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar PDF'}</span>
        </button>
      </div>
    </header>
  );
};
