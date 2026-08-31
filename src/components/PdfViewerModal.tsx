import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  GraduationCap, 
  QrCode,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Agreement } from '../types';

interface PdfViewerModalProps {
  agreement: Agreement;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ agreement, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'pdf' | 'template'>(
    agreement.documentUrl ? 'pdf' : 'template'
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const docName = agreement.documentName || `وثيقة_${agreement.partnerName.replace(/\s+/g, '_')}_المعتمدة.pdf`;
  const docSize = agreement.documentSize || '2.4 MB';
  const uploadDate = agreement.documentUploadDate || agreement.signDate || '2024-01-15';

  // Convert Base64 Data URL to real Blob URL for reliable Chrome/Browser rendering & opening in new tab
  useEffect(() => {
    if (!agreement.documentUrl) {
      setBlobUrl(null);
      return;
    }

    if (agreement.documentUrl.startsWith('blob:')) {
      setBlobUrl(agreement.documentUrl);
      return;
    }

    if (agreement.documentUrl.startsWith('data:')) {
      try {
        const parts = agreement.documentUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const base64Data = parts[1];
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error generating PDF Blob URL:', err);
        setBlobUrl(agreement.documentUrl);
      }
    } else {
      setBlobUrl(agreement.documentUrl);
    }
  }, [agreement.documentUrl]);

  const activePdfUrl = blobUrl || agreement.documentUrl;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(160, prev + 15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(70, prev - 15));

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (activePdfUrl) {
      const a = document.createElement('a');
      a.href = activePdfUrl;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  const handleOpenInNewTab = () => {
    if (activePdfUrl) {
      window.open(activePdfUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className={`bg-slate-900 rounded-3xl w-full flex flex-col shadow-2xl border border-slate-700 transition-all ${
        isFullscreen ? 'fixed inset-2 z-50 h-[calc(100vh-16px)]' : 'max-w-5xl max-h-[94vh]'
      }`}>
        
        {/* PDF Top Bar / Toolbar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 rounded-t-3xl border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate" title={docName}>
                  {docName}
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {agreement.documentUrl ? 'ملف مرفق معتمد' : 'وثيقة رقمية معتمدة'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {docSize} • تم التوثيق: {uploadDate} • رقم القيد: {agreement.id}
              </p>
            </div>
          </div>

          {/* Controls: Mode Switch, Open in New Tab, Zoom, Page, Print, Download, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            {/* View Mode Toggle if Document URL exists */}
            {agreement.documentUrl && (
              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'pdf'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  الملف المرفوع (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('template')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'template'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  النموذج المعتمد
                </button>
              </div>
            )}

            {/* Open in New Tab Button (Chrome Iframe Bypass) */}
            {activePdfUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer border border-blue-500/40"
                title="فتح ملف الـ PDF في نافذة أو تبويب مستقل لتفادي حظر الإطارات"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فتح في تبويب جديد</span>
              </button>
            )}

            {/* Zoom Controls (when template mode) */}
            {viewMode === 'template' && (
              <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700 text-xs">
                <button 
                  onClick={handleZoomOut} 
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-slate-300 text-[11px]">{zoomLevel}%</span>
                <button 
                  onClick={handleZoomIn} 
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Page Navigation (when template mode) */}
            {viewMode === 'template' && (
              <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700 text-xs">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentPage === 1 ? 'text-slate-600' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-slate-300 text-[11px]">
                  {currentPage} / 2
                </span>
                <button
                  onClick={() => setCurrentPage(2)}
                  disabled={currentPage === 2}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentPage === 2 ? 'text-slate-600' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="طباعة الوثيقة"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              title="تحميل وثيقة PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحميل PDF</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer hidden md:block"
              title={isFullscreen ? 'تصغير النافذة' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer mr-1"
              title="إغلاق المعاينة"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Browser Sandbox & Direct Action Banner (When viewing uploaded PDF) */}
        {viewMode === 'pdf' && activePdfUrl && (
          <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                في حال قيام المتصفح بحظر استعراض ملف الـ PDF داخل الإطار، يمكنك فتحه مباشرة بنقرة واحدة:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح الوثيقة في تبويب جديد</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف</span>
              </button>
            </div>
          </div>
        )}

        {/* PDF Document Canvas Viewport */}
        <div className="flex-1 bg-slate-800/95 p-3 sm:p-6 overflow-y-auto flex justify-center items-start min-h-[500px]">
          
          {viewMode === 'pdf' && activePdfUrl ? (
            // Real Uploaded PDF Canvas with Object / Embed / Iframe + Fallback Card
            <div className="w-full max-w-5xl h-[80vh] min-h-[650px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
              <object
                data={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full flex-1 h-full min-h-[550px]"
              >
                {/* Embedded Fallback if <object> is blocked by Chrome sandbox */}
                <iframe
                  src={`${activePdfUrl}#toolbar=1`}
                  title={docName}
                  className="w-full flex-1 h-full min-h-[550px] border-0"
                >
                  <div className="p-8 text-center bg-slate-900 text-white flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">
                        تعذر عرض المعاينة التلقائية داخل الإطار
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        يمنع المتصفح تشغيل ملحقات PDF المدمجة داخل هذا الإطار لأسباب أمنية. يمكنك فتح الملف المرفق مباشرة في تبويب جديد أو تنزيله لجهازك.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>فتح الوثيقة في تبويب جديد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('template')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض النموذج المعتمد</span>
                      </button>
                    </div>
                  </div>
                </iframe>
              </object>
            </div>
          ) : (
            // High-Fidelity Official Document Preview (Saudi University Agreement Form)
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-[780px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 transition-transform border border-slate-300 relative select-text"
            >
              {/* Document Header */}
              <div className="border-b-2 border-emerald-900 pb-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">المملكة العربية السعودية</p>
                    <p className="text-xs font-bold text-slate-800">وزارة التعليم</p>
                    <p className="text-xs font-black text-emerald-900">جامعة المجمعة</p>
                    <p className="text-[11px] font-bold text-slate-700">الكلية التطبيقية — وحدة الشراكات</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-400 flex items-center justify-center shadow-md mb-1 border border-emerald-700">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-950">MAJMAAH UNIVERSITY</span>
                  </div>

                  <div className="text-left font-mono text-[11px] text-slate-700 space-y-0.5">
                    <p><strong>الرقم:</strong> {agreement.id}</p>
                    <p><strong>التاريخ:</strong> {agreement.signDate}</p>
                    <p><strong>المرفقات:</strong> ({agreement.attachmentsCount || 1}) وثائق</p>
                    <p><strong>التصنيف:</strong> رسمي / معتمد</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-md text-xs font-black">
                    {agreement.agreementType}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                    وثيقة تعاون وشراكة رسمية مع ({agreement.partnerName})
                  </h2>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <GraduationCap className="w-96 h-96 text-emerald-900" />
              </div>

              {/* Page 1 Content */}
              {currentPage === 1 ? (
                <div className="space-y-5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  
                  {/* Parties Block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-black text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-800" />
                      أطراف الاتفاقية:
                    </h4>
                    <p>
                      <strong>الطرف الأول:</strong> جامعة المجمعة — متمثلة في الكلية التطبيقية (وحدة الشراكات)، ويمثلها بالنيابة: <span className="text-emerald-900 font-bold">{agreement.collegeRepresentative}</span>.
                    </p>
                    <p>
                      <strong>الطرف الثاني:</strong> {agreement.partnerName} ({agreement.sector})، ويمثلها قانونياً: <span className="text-emerald-900 font-bold">{agreement.partnerRepresentative || 'المفوض الرسمي'}</span>، ومقرها: {agreement.city}.
                    </p>
                  </div>

                  {/* Preamble */}
                  <div>
                    <h4 className="font-black text-slate-900 text-xs mb-1.5">المقدمة والتمهيد:</h4>
                    <p className="text-slate-700 text-justify text-xs leading-6">
                      انطلاقاً من رؤية المملكة 2030 لتعزيز التكامل بين قطاع التعليم العالي وسوق العمل، وتجسيداً للأهداف الاستراتيجية للكلية التطبيقية بجامعة المجمعة في توفير بيئات تدريبية وتوظيفية متميزة لطلبتها وخريجيها، التقت إرادة الطرفين على إبرام هذا التعاون المشترك وفق البنود التالية.
                    </p>
                  </div>

                  {/* Scope & Domains */}
                  <div>
                    <h4 className="font-black text-slate-900 text-xs mb-1.5">مجالات ونطاق التعاون المتفق عليها:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                      {agreement.domains.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-950">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Targets & Period */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">المستهدف السنوي للتدريب:</span>
                      <strong className="text-slate-900 font-mono text-sm">{agreement.targetTrainingCount} مستفيد</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">المستهدف السنوي للتوظيف:</span>
                      <strong className="text-slate-900 font-mono text-sm">{agreement.targetEmploymentCount} مستفيد</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">مدة الاتفاقية وسريانها:</span>
                      <strong className="text-slate-900">من {agreement.signDate} إلى {agreement.expiryDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">حالة الوثيقة:</span>
                      <strong className="text-emerald-800 font-bold">{agreement.status}</strong>
                    </div>
                  </div>

                  {/* Summary notes */}
                  {agreement.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <strong>ملاحظات إضافية:</strong> {agreement.notes}
                    </div>
                  )}

                  <div className="text-center pt-3 text-slate-400 text-[11px]">
                    - الصفحة 1 من 2 -
                  </div>
                </div>
              ) : (
                /* Page 2 Content */
                <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  
                  {/* General Obligations */}
                  <div>
                    <h4 className="font-black text-slate-900 text-xs mb-2">التزامات الطرفين والأحكام العامة:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 text-justify">
                      <li>يلتزم الطرف الأول بتوجيه الطلبة المؤهلين واستكمال المتطلبات الأكاديمية واللوائح النظامية.</li>
                      <li>يلتزم الطرف الثاني بتوفير بيئة تدريبية مناسبة، وتعيين مشرف ميداني لمتابعة وتقييم المستفيدين.</li>
                      <li>تخضع هذه الاتفاقية للأنظمة واللوائح السارية في المملكة العربية السعودية وتعتبر نافذة من تاريخ التوقيع.</li>
                      <li>تتم مراجعة مؤشرات الأداء والتقارير الدورية عبر نظام إدارة الشراكات بالكلية التطبيقية.</li>
                    </ol>
                  </div>

                  {/* Signatures & Official Seals */}
                  <div className="pt-8 border-t-2 border-slate-200 mt-8">
                    <h4 className="font-black text-slate-900 text-xs mb-6 text-center">
                      التواقيع والاعتمادات الرسمية
                    </h4>

                    <div className="grid grid-cols-2 gap-8 text-center text-xs">
                      
                      {/* College Side */}
                      <div className="p-4 rounded-xl border border-dashed border-emerald-700 bg-emerald-50/40 relative">
                        <p className="font-bold text-emerald-950 mb-1">عن الطرف الأول:</p>
                        <p className="font-bold text-slate-900">{agreement.collegeRepresentative}</p>
                        <p className="text-[11px] text-slate-500">الكلية التطبيقية - جامعة المجمعة</p>
                        
                        {/* Digital Stamp Simulation */}
                        <div className="mt-4 inline-flex flex-col items-center justify-center p-3 rounded-full border-2 border-emerald-700 text-emerald-900 bg-emerald-100/60 shadow-xs rotate-[-6deg]">
                          <ShieldCheck className="w-6 h-6 text-emerald-700 mb-0.5" />
                          <span className="text-[9px] font-black leading-none">مُعتمد إلكترونياً</span>
                          <span className="text-[8px] font-mono leading-none mt-0.5">MU-APPLIED-COLL</span>
                        </div>
                      </div>

                      {/* Partner Side */}
                      <div className="p-4 rounded-xl border border-dashed border-slate-400 bg-slate-50 relative">
                        <p className="font-bold text-slate-900 mb-1">عن الطرف الثاني:</p>
                        <p className="font-bold text-slate-900">{agreement.partnerRepresentative || 'المفوض بالجهة'}</p>
                        <p className="text-[11px] text-slate-500">{agreement.partnerName}</p>
                        
                        {/* Partner Stamp Simulation */}
                        <div className="mt-4 inline-flex flex-col items-center justify-center p-3 rounded-full border-2 border-slate-700 text-slate-900 bg-slate-200/60 shadow-xs rotate-[5deg]">
                          <Building2 className="w-6 h-6 text-slate-700 mb-0.5" />
                          <span className="text-[9px] font-black leading-none">خاتم وتوقيع الشريك</span>
                          <span className="text-[8px] font-mono leading-none mt-0.5">VERIFIED & SIGNED</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Verification QR and Security Stamp */}
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center text-slate-800">
                        <QrCode className="w-10 h-10" />
                      </div>
                      <div className="text-[10px] text-slate-600">
                        <p className="font-bold text-slate-800">التحقق الرقمي من الوثيقة</p>
                        <p className="font-mono">DOC-HASH: {agreement.id}-{agreement.signDate.replace(/-/g, '')}-VERIFIED</p>
                        <p>وثيقة رسمية صادرة من نظام إدارة الشراكات الإلكتروني بجامعة المجمعة</p>
                      </div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-emerald-800 font-bold">
                      ✓ رقمية معتمدة
                    </div>
                  </div>

                  <div className="text-center pt-3 text-slate-400 text-[11px]">
                    - الصفحة 2 من 2 - نهاية الوثيقة -
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 rounded-b-3xl border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الوثائق الرقمية المعتمدة — الكلية التطبيقية بجامعة المجمعة</span>
          </div>
          <div className="flex items-center gap-2">
            {activePdfUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في تبويب جديد</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition-colors cursor-pointer"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

