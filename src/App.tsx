import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { ExtractedTextItem, PageMeta, PDFElement, PDFMetadata, StampType, ToolType } from './types/pdf';
import { loadPDF, saveModifiedPDF } from './utils/pdfEngine';
import { generateSamplePDF } from './utils/samplePdf';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PageSidebar } from './components/PageSidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { PDFCanvas } from './components/PDFCanvas';
import { SignatureModal } from './components/SignatureModal';
import { PageManagerModal } from './components/PageManagerModal';
import { MetadataModal } from './components/MetadataModal';

export const App: React.FC = () => {
  const [fileName, setFileName] = useState<string>('Contrato_Exemplo.pdf');
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfjsDoc, setPdfjsDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [extractedTextByPage, setExtractedTextByPage] = useState<Record<number, ExtractedTextItem[]>>({});
  const [metadata, setMetadata] = useState<PDFMetadata>({
    title: 'Contrato de Prestação de Serviços',
    author: 'João Silva',
    subject: 'Contrato Comercial',
    keywords: 'contrato, pdf, editado',
    creator: 'EditPDF Pro v1.0',
    producer: 'pdf-lib',
  });

  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [elements, setElements] = useState<PDFElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [isPageManagerOpen, setIsPageManagerOpen] = useState<boolean>(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState<boolean>(false);

  const [history, setHistory] = useState<PDFElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  useEffect(() => {
    loadSampleDocument('contract');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const pushHistory = (newElements: PDFElement[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newElements);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setElements(history[prevIndex]);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setElements(history[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  };

  const loadPDFBuffer = async (buffer: ArrayBuffer, name: string) => {
    try {
      setPdfBuffer(buffer);
      setFileName(name);
      
      const result = await loadPDF(buffer);
      setPdfjsDoc(result.pdfjsDoc);
      setPages(result.pages);
      setPageOrder(result.pages.map((p) => p.pageIndex));
      setExtractedTextByPage(result.extractedTextByPage);
      setMetadata(result.metadata);
      setCurrentPageIndex(0);
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Error loading PDF file:', err);
      alert('Falha ao carregar o arquivo PDF. Verifique se o arquivo é válido.');
    }
  };

  const loadSampleDocument = async (type: 'contract' | 'invoice') => {
    const sampleBytes = await generateSamplePDF(type);
    const sampleName = type === 'contract' ? 'Contrato_Prestacao_Servicos.pdf' : 'Fatura_Comercial.pdf';
    await loadPDFBuffer(sampleBytes.buffer, sampleName);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        loadPDFBuffer(e.target.result, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.min(3.0, Math.max(0.4, +newZoom.toFixed(2))));
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)));
  const handleZoomReset = () => setZoom(1.0);

  const handleAddElement = (element: PDFElement) => {
    const updated = [...elements, element];
    setElements(updated);
    pushHistory(updated);
  };

  const handleUpdateElement = (updatedElement: PDFElement) => {
    const updated = elements.map((el) => (el.id === updatedElement.id ? updatedElement : el));
    setElements(updated);
    pushHistory(updated);
  };

  const handleDeleteElement = (id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    setElements(updated);
    if (selectedElementId === id) setSelectedElementId(null);
    pushHistory(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (typeof evt.target?.result === 'string') {
          const newImg: PDFElement = {
            id: `img-${Date.now()}`,
            pageIndex: currentPageIndex,
            type: 'image',
            x: 100,
            y: 200,
            width: 160,
            height: 120,
            content: evt.target.result,
            fontFamily: 'Helvetica',
            fontSize: 12,
            color: '#000000',
          };
          handleAddElement(newImg);
          setSelectedElementId(newImg.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStamp = (stampText: StampType) => {
    const stampColors: Record<StampType, string> = {
      APROVADO: '#16a34a',
      REJEITADO: '#dc2626',
      CONFIDENCIAL: '#d97706',
      PAGO: '#2563eb',
      RASCUNHO: '#64748b',
      COPIA: '#475569',
    };

    const newStamp: PDFElement = {
      id: `stamp-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'stamp',
      x: 120,
      y: 150,
      width: 180,
      height: 48,
      content: stampText,
      fontFamily: 'Helvetica-Bold',
      fontSize: 18,
      color: stampColors[stampText] || '#dc2626',
    };

    handleAddElement(newStamp);
    setSelectedElementId(newStamp.id);
  };

  const handleConfirmSignature = (signatureBase64: string) => {
    const newSig: PDFElement = {
      id: `sig-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'signature',
      x: 100,
      y: 350,
      width: 180,
      height: 70,
      content: signatureBase64,
      fontFamily: 'Helvetica',
      fontSize: 12,
      color: '#000000',
    };
    handleAddElement(newSig);
    setSelectedElementId(newSig.id);
  };

  const handleRotatePage = (index: number) => {
    const updatedPages = [...pages];
    updatedPages[index] = {
      ...updatedPages[index],
      rotation: (updatedPages[index].rotation + 90) % 360,
    };
    setPages(updatedPages);
  };

  const handleMovePageUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setPageOrder(newOrder);
  };

  const handleMovePageDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setPageOrder(newOrder);
  };

  const handleDeletePage = (index: number) => {
    if (pageOrder.length <= 1) return;
    const newOrder = pageOrder.filter((_, idx) => idx !== index);
    setPageOrder(newOrder);
    if (currentPageIndex >= newOrder.length) {
      setCurrentPageIndex(newOrder.length - 1);
    }
  };

  const handleAddBlankPage = () => {
    const newIndex = pages.length;
    const newPageMeta: PageMeta = {
      pageIndex: newIndex,
      width: 595.28,
      height: 841.89,
      rotation: 0,
    };
    setPages([...pages, newPageMeta]);
    setPageOrder([...pageOrder, newIndex]);
    setCurrentPageIndex(pageOrder.length);
  };

  const handleSavePDF = async () => {
    if (!pdfBuffer) return;
    try {
      setIsSaving(true);
      const modifiedBytes = await saveModifiedPDF(pdfBuffer, elements, pages, pageOrder, metadata);
      
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Editado_${fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error saving PDF:', err);
      alert('Ocorreu um erro ao gerar e salvar o PDF editado.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y, Delete & Arrow Key Nudging)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' && selectedElementId) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
      } else if (
        selectedElement &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1; // 1pt nudge or 10pt with Shift key
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        handleUpdateElement({
          ...selectedElement,
          x: Math.max(0, selectedElement.x + dx),
          y: Math.max(0, selectedElement.y + dy),
        });
      }
    },
    [historyIndex, history, selectedElementId, selectedElement]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Header
        fileName={fileName}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFileUpload={handleFileUpload}
        onLoadSample={loadSampleDocument}
        onSavePDF={handleSavePDF}
        onOpenPageManager={() => setIsPageManagerOpen(true)}
        onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
        isSaving={isSaving}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onAddStamp={handleAddStamp}
        onImageUpload={handleImageUpload}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <PageSidebar
          pages={pages}
          currentPageIndex={currentPageIndex}
          onSelectPage={setCurrentPageIndex}
          onMovePageUp={handleMovePageUp}
          onMovePageDown={handleMovePageDown}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          onAddBlankPage={handleAddBlankPage}
        />

        <PDFCanvas
          pdfjsDoc={pdfjsDoc}
          currentPageMeta={pages[currentPageIndex] || null}
          currentPageIndex={currentPageIndex}
          zoom={zoom}
          activeTool={activeTool}
          elements={elements}
          extractedText={extractedTextByPage[currentPageIndex] || []}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onZoomChange={handleZoomChange}
        />

        <PropertyPanel
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
        />
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirmSignature={handleConfirmSignature}
      />

      <PageManagerModal
        isOpen={isPageManagerOpen}
        pages={pages}
        pageOrder={pageOrder}
        onClose={() => setIsPageManagerOpen(false)}
        onMovePage={(from, to) => {
          const newOrder = [...pageOrder];
          const [moved] = newOrder.splice(from, 1);
          newOrder.splice(to, 0, moved);
          setPageOrder(newOrder);
        }}
        onRotatePage={handleRotatePage}
        onDeletePage={handleDeletePage}
        onAddBlankPage={handleAddBlankPage}
      />

      <MetadataModal
        isOpen={isMetadataModalOpen}
        metadata={metadata}
        onClose={() => setIsMetadataModalOpen(false)}
        onSaveMetadata={setMetadata}
      />
    </div>
  );
};

export default App;
