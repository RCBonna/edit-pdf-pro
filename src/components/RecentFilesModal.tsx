import React from 'react';
import { FileText, Clock, Trash2, Upload, Sparkles, X, HardDrive, CheckCircle2 } from 'lucide-react';
import { RecentFile, formatBytes, formatRecentDate } from '../utils/recentFiles';

interface RecentFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentFiles: RecentFile[];
  onSelectRecentFile: (file: RecentFile) => void;
  onDeleteRecentFile: (id: string, e: React.MouseEvent) => void;
  onClearRecentFiles: () => void;
  onOpenFilePicker: () => void;
  onLoadSample: (type: 'contract' | 'invoice') => void;
  currentFileName?: string;
}

export const RecentFilesModal: React.FC<RecentFilesModalProps> = ({
  isOpen,
  onClose,
  recentFiles,
  onSelectRecentFile,
  onDeleteRecentFile,
  onClearRecentFiles,
  onOpenFilePicker,
  onLoadSample,
  currentFileName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Arquivos Recentes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Últimos 10 documentos abertos neste navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Row: Open File & Samples */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                onOpenFilePicker();
                onClose();
              }}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl border-2 border-dashed border-blue-400 dark:border-blue-600/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Abrir Novo PDF</span>
            </button>

            <button
              onClick={() => {
                onLoadSample('contract');
                onClose();
              }}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Exemplo Contrato</span>
            </button>

            <button
              onClick={() => {
                onLoadSample('invoice');
                onClose();
              }}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Exemplo Fatura</span>
            </button>
          </div>

          {/* Recent Files List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Histórico Recente ({recentFiles.length}/10)
              </span>
              {recentFiles.length > 0 && (
                <button
                  onClick={onClearRecentFiles}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center space-x-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar Histórico</span>
                </button>
              )}
            </div>

            {recentFiles.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                <HardDrive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Nenhum arquivo no histórico recente.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Os últimos 10 PDFs abertos ficarão salvos aqui para acesso rápido.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFiles.map((file) => {
                  const isCurrent = file.name === currentFileName;
                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        onSelectRecentFile(file);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-500/80 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {file.name}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Aberto</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span>{formatRecentDate(file.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => onDeleteRecentFile(file.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Remover do histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
          <span>EditPDF Pro v1.1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
