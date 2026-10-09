import React from 'react';
import {
  MousePointer,
  Type,
  FormInput,
  CheckSquare,
  PenTool,
  Image as ImageIcon,
  Square,
  Highlighter,
  EyeOff,
  Stamp,
  Hand,
} from 'lucide-react';
import type { ToolType, StampType } from '../types/pdf';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddStamp: (stampText: StampType) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSignatureModal: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddStamp,
  onImageUpload,
  onOpenSignatureModal,
}) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [stampMenuOpen, setStampMenuOpen] = React.useState(false);

  const stamps: StampType[] = ['APROVADO', 'REJEITADO', 'CONFIDENCIAL', 'PAGO', 'RASCUNHO', 'COPIA'];

  return (
    <div className="app-toolbar flex items-center justify-center space-x-1 p-1.5 border-b select-none shadow-sm overflow-x-auto">
      {/* Selection Tool */}
      <button
        onClick={() => onSelectTool('select')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'select'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Selecionar e editar texto existente ou objetos"
      >
        <MousePointer className="w-4 h-4" />
        <span>Selecionar / Editar Texto</span>
      </button>

      {/* Add Text Tool */}
      <button
        onClick={() => onSelectTool('text')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'text'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Adicionar novo texto"
      >
        <Type className="w-4 h-4" />
        <span>Novo Texto</span>
      </button>

      <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Form Controls */}
      <button
        onClick={() => onSelectTool('form-text')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'form-text'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Criar Campo de Texto Interativo de Formulário"
      >
        <FormInput className="w-4 h-4" />
        <span>Campo Formulário</span>
      </button>

      <button
        onClick={() => onSelectTool('form-checkbox')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'form-checkbox'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Criar Caixa de Seleção (Checkbox)"
      >
        <CheckSquare className="w-4 h-4" />
        <span>Caixa de Seleção</span>
      </button>

      <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Signature Tool */}
      <button
        onClick={() => {
          onSelectTool('signature');
          onOpenSignatureModal();
        }}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'signature'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Desenhar ou inserir Assinatura Digital"
      >
        <PenTool className="w-4 h-4 text-emerald-500" />
        <span>Assinatura</span>
      </button>

      {/* Image Tool */}
      <button
        onClick={() => imageInputRef.current?.click()}
        className="tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        title="Inserir imagem (PNG / JPG)"
      >
        <ImageIcon className="w-4 h-4 text-amber-500" />
        <span>Inserir Imagem</span>
      </button>
      <input
        type="file"
        ref={imageInputRef}
        onChange={onImageUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Annotations & Shapes */}
      <button
        onClick={() => onSelectTool('highlight')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'highlight'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Destaque Marcador Amarelo"
      >
        <Highlighter className="w-4 h-4 text-yellow-500" />
        <span>Destaque</span>
      </button>

      <button
        onClick={() => onSelectTool('redact')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'redact'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Tarja de Ocultação / Tarjar Dados Confidenciais"
      >
        <EyeOff className="w-4 h-4 text-rose-500" />
        <span>Tarjar</span>
      </button>

      <button
        onClick={() => onSelectTool('rect')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'rect'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Desenhar Retângulo / Caixas"
      >
        <Square className="w-4 h-4" />
        <span>Retângulo</span>
      </button>

      {/* Stamp Dropdown Menu */}
      <div className="relative">
        <button
          onClick={() => setStampMenuOpen(!stampMenuOpen)}
          className="tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title="Adicionar Carimbo de Documento"
        >
          <Stamp className="w-4 h-4 text-indigo-500" />
          <span>Carimbo</span>
        </button>

        {stampMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1">
            {stamps.map((stampText) => (
              <button
                key={stampText}
                onClick={() => {
                  onAddStamp(stampText);
                  setStampMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                {stampText}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Pan Tool */}
      <button
        onClick={() => onSelectTool('pan')}
        className={`tool-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'pan'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Modo Mover / Panorâmica"
      >
        <Hand className="w-4 h-4" />
        <span>Mover</span>
      </button>
    </div>
  );
};
