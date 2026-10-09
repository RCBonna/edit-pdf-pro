import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Eraser, Type, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignature: (signatureBase64: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirmSignature,
}) => {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [inkColor, setInkColor] = useState<string>('#000000');
  const [typedName, setTypedName] = useState<string>('João Silva');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen && tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, tab, inkColor]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = inkColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onConfirmSignature(dataUrl);
    } else {
      // Create canvas for typed signature
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 150;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, 400, 150);
        ctx.font = 'italic 38px "Dancing Script", "Brush Script MT", cursive, sans-serif';
        ctx.fillStyle = inkColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Assinatura', 200, 75);
        
        // Underline stroke
        ctx.beginPath();
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2;
        ctx.moveTo(50, 110);
        ctx.quadraticCurveTo(200, 125, 350, 110);
        ctx.stroke();

        onConfirmSignature(offscreen.toDataURL('image/png'));
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Assinatura Digital
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-4 space-y-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTab('draw')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'draw'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Desenhar Assinatura</span>
            </button>
            <button
              onClick={() => setTab('type')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'type'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Digitar Nome</span>
            </button>
          </div>

          {/* Color Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Cor da Caneta / Tinta:
            </span>
            <div className="flex items-center space-x-2">
              {[
                { color: '#000000', label: 'Preto' },
                { color: '#1e3a8a', label: 'Azul' },
                { color: '#b91c1c', label: 'Vermelho' },
              ].map((item) => (
                <button
                  key={item.color}
                  onClick={() => setInkColor(item.color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    inkColor === item.color ? 'scale-125 border-blue-500 shadow' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.label}
                />
              ))}
            </div>
          </div>

          {/* Drawing Canvas / Type Input */}
          {tab === 'draw' ? (
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={450}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair touch-none"
              />
              <button
                onClick={clearCanvas}
                className="absolute top-2 right-2 flex items-center space-x-1 px-2.5 py-1 bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium backdrop-blur-sm"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Digite seu nome completo..."
                className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
              {/* Preview Box */}
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[120px]">
                <span
                  className="text-3xl italic tracking-wider font-serif"
                  style={{ color: inkColor, fontFamily: 'serif' }}
                >
                  {typedName || 'Sua Assinatura'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Inserir Assinatura</span>
          </button>
        </div>
      </div>
    </div>
  );
};
