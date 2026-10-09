import React, { useState, useEffect } from 'react';
import type { PDFMetadata } from '../types/pdf';
import { X, FileText, User, Tag, Calendar, Save, Info, ShieldCheck } from 'lucide-react';

interface MetadataModalProps {
  isOpen: boolean;
  metadata: PDFMetadata;
  onClose: () => void;
  onSaveMetadata: (updated: PDFMetadata) => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  metadata,
  onClose,
  onSaveMetadata,
}) => {
  const [form, setForm] = useState<PDFMetadata>(metadata);

  useEffect(() => {
    setForm(metadata);
  }, [metadata, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMetadata({
      ...form,
      modificationDate: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Informações e Metadados do Documento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico de edição e propriedades do arquivo PDF.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Fields */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Info Banner */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start space-x-2 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Estes dados serão incorporados ao arquivo PDF final para fins de autoria, auditoria e indexação.
            </span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Título do Documento</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Contrato de Prestação de Serviços"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Author */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Autor / Quem Editou</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Ex: Nome do Editor ou Empresa"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assunto / Descrição
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Ex: Nota Fiscal de Serviços - Edição de Campos"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Palavras-chave (separadas por vírgula)</span>
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="Ex: nota fiscal, contrato, editado, 2026"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Creator & Producer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Criador (Software Originário)
              </label>
              <input
                type="text"
                value={form.creator}
                onChange={(e) => setForm({ ...form, creator: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Produtor PDF (Engine)
              </label>
              <input
                type="text"
                value={form.producer}
                onChange={(e) => setForm({ ...form, producer: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Dates Display */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Data de Criação: {form.creationDate ? new Date(form.creationDate).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Última Modificação: {form.modificationDate ? new Date(form.modificationDate).toLocaleString() : 'Agora'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Informações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
