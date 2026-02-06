
import React, { useState, useRef, useEffect } from 'react';
import { Award, ShieldCheck, X, FileText, ExternalLink, ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut, RotateCcw, Hand } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Konfiguracja workera PDF.js z CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Certificates: React.FC = () => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const certs = [
    {
      url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
      title: 'Certyfikat Księgowy I',
      desc: 'Wydany przez Ministra Finansów',
      pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    },
    {
      url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
      title: 'Certyfikat Księgowy II',
      desc: 'Uprawnienia do usługowego prowadzenia ksiąg',
      pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    }
  ];

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setScale(1.0);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1.0);

  // Grab-to-pan logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    // e.pageX i e.pageY są względem całego dokumentu
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX); 
    const walkY = (y - startY);
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Nasze Certyfikaty
          </h1>
          <p className="text-xl text-slate-400">
            Gwarancja najwyższych kompetencji potwierdzona państwowymi uprawnieniami.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-widest border border-blue-100">
                Ministerstwo Finansów
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Uprawnienia wydane przez Ministerstwo Finansów
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Działalność Biura Rachunkowego TEWU oparta jest na solidnych fundamentach prawnych i merytorycznych. Posiadamy <strong>Certyfikaty Księgowe wydane przez Ministra Finansów</strong>, które uprawniają nas do usługowego prowadzenia ksiąg rachunkowych.
                </p>
                <p>
                  Uzyskanie takich certyfikatów wiąże się ze spełnieniem rygorystycznych wymogów dotyczących wykształcenia, praktyki zawodowej oraz nieposzlakowanej opinii. Dla naszych Klientów to pewność, że powierzają swoje finanse w ręce profesjonalistów, których wiedza została zweryfikowana na szczeblu państwowym.
                </p>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-4">
                <ShieldCheck className="text-blue-600 w-8 h-8 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Pełne Bezpieczeństwo</h4>
                  <p className="text-slate-600 text-sm">Posiadane uprawnienia są uzupełnione wysoką polisą ubezpieczenia OC, co stanowi kompleksową ochronę dla obsługiwanych przez nas podmiotów.</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {certs.map((cert, index) => (
                <div 
                  key={index}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500"
                  onClick={() => setSelectedPdf(cert.pdfUrl)}
                >
                  <img 
                    src={cert.url} 
                    alt={cert.title} 
                    className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-full text-slate-900 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                      <FileText size={32} className="text-blue-600" />
                    </div>
                    <p className="text-white font-bold mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all delay-75">
                      Podgląd Dokumentu
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
                    <p className="text-white font-bold">{cert.title}</p>
                    <p className="text-slate-300 text-xs">{cert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PDF Preview Modal */}
      {selectedPdf && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedPdf(null)}
        >
          <div 
            className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-widest hidden sm:inline">Podgląd PDF</span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-6">
                {numPages && numPages > 1 && (
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                    <button 
                      disabled={pageNumber <= 1}
                      onClick={() => changePage(-1)}
                      className="p-1 disabled:opacity-30 hover:text-blue-600 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-slate-600 min-w-[40px] text-center">
                      {pageNumber} / {numPages}
                    </span>
                    <button 
                      disabled={pageNumber >= (numPages || 0)}
                      onClick={() => changePage(1)}
                      className="p-1 disabled:opacity-30 hover:text-blue-600 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm">
                  <button 
                    onClick={handleZoomOut}
                    className="p-1 hover:text-blue-600 text-slate-600 transition-colors"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="text-[10px] font-black text-slate-500 w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button 
                    onClick={handleZoomIn}
                    className="p-1 hover:text-blue-600 text-slate-600 transition-colors"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                  <button 
                    onClick={handleResetZoom}
                    className="p-1 hover:text-blue-600 text-slate-600 transition-colors"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={selectedPdf} 
                  download 
                  className="p-2 text-slate-600 hover:text-blue-600"
                  title="Pobierz"
                >
                  <Download size={20} />
                </a>
                <button 
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-900 transition-colors"
                  onClick={() => setSelectedPdf(null)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Viewport with true zoom support */}
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex-grow bg-slate-200 overflow-auto scrollbar-thin scrollbar-thumb-slate-400 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <div 
                className="min-h-full flex items-start justify-center p-8 md:p-16"
                style={{ width: 'fit-content', margin: '0 auto' }}
              >
                <Document
                  file={selectedPdf}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-500 py-20">
                      <Loader2 className="animate-spin" size={48} />
                      <p className="font-bold">Wczytywanie...</p>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    className="shadow-2xl bg-white transition-shadow duration-300"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={null}
                  />
                </Document>
              </div>
            </div>
            
            {scale > 1.2 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 pointer-events-none border border-white/10 shadow-2xl">
                <Hand size={14} className="text-blue-400" /> Przeciągnij, aby przesunąć widok
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
