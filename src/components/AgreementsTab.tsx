import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  ArrowLeft, 
  GraduationCap, 
  Briefcase, 
  Activity, 
  Award, 
  Smile, 
  LayoutGrid, 
  List, 
  FileText,
  X,
  TrendingUp,
  Tag,
  Upload,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { PdfViewerModal } from './PdfViewerModal';
import { 
  Agreement, 
  ExecutionActivity, 
  PartnerSurvey, 
  PartnerEvaluation, 
  SectorType, 
  AgreementStatus, 
  AgreementType 
} from '../types';

interface AgreementsTabProps {
  agreements: Agreement[];
  executions: ExecutionActivity[];
  surveys: PartnerSurvey[];
  evaluations: PartnerEvaluation[];
  selectedAgreementId: string | null;
  onSelectAgreement: (agreement: Agreement) => void;
  onAddAgreement: (agreement: Agreement) => void;
  onUpdateAgreement: (agreement: Agreement) => void;
  onDeleteAgreement: (id: string) => void;
  onNavigateToTab: (tab: 'execution' | 'survey' | 'evaluation') => void;
}

const SECTOR_OPTIONS: SectorType[] = ['حكومي', 'خاص', 'غير ربحي', 'شبه حكومي'];
const STATUS_OPTIONS: AgreementStatus[] = ['سارية', 'جديدة', 'قيد التوقيع', 'منتهية', 'قيد التجديد'];
const AGREEMENT_TYPE_OPTIONS: AgreementType[] = [
  'عقد شراكة استراتيجية',
  'اتفاقية تعاون',
  'مذكرة تفاهم',
  'بروتوكول تدريب وتوظيف'
];

const COMMON_DOMAINS = [
  'تدريب تعاوني',
  'توظيف الخريجين',
  'تطوير مناهج',
  'ساعات تدريب إكلينيكي',
  'ورش عمل وتطوير',
  'استشارات وبحوث',
  'دبلومات تطبيقية متخصصة',
  'رعاية مشاريع التخرج',
  'زيارات ميدانية',
  'تطوع تخصصي'
];

export const AgreementsTab: React.FC<AgreementsTabProps> = ({
  agreements,
  executions,
  surveys,
  evaluations,
  selectedAgreementId,
  onSelectAgreement,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  onNavigateToTab
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
  const [viewingAgreement, setViewingAgreement] = useState<Agreement | null>(null);
  const [pdfModalAgreement, setPdfModalAgreement] = useState<Agreement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Form State
  const initialFormState: Omit<Agreement, 'id' | 'createdAt'> = {
    partnerName: '',
    sector: 'خاص',
    agreementType: 'اتفاقية تعاون',
    domains: ['تدريب تعاوني'],
    status: 'سارية',
    signDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0],
    collegeRepresentative: 'د. عبدالله بن علي السعدون (مساعد رئيس الكلية التطبيقية)',
    partnerRepresentative: '',
    contactPhone: '',
    contactEmail: '',
    city: 'المجمعة',
    targetTrainingCount: 50,
    targetEmploymentCount: 20,
    notes: '',
    attachmentsCount: 1,
    documentUrl: '',
    documentName: '',
    documentSize: '',
    documentUploadDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [customDomainInput, setCustomDomainInput] = useState('');

  // Handle PDF File Upload (via drag & drop or file picker)
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('عذراً، يرجى اختيار ملف بصيغة PDF فقط.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFormData(prev => ({
        ...prev,
        documentUrl: dataUrl,
        documentName: file.name,
        documentSize: `${sizeInMb} MB`,
        documentUploadDate: new Date().toISOString().split('T')[0],
        attachmentsCount: (prev.attachmentsCount || 1)
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      documentUrl: '',
      documentName: '',
      documentSize: '',
      documentUploadDate: ''
    }));
  };

  // Calculate actual execution metrics per agreement
  const agreementMetricsMap = useMemo(() => {
    const map = new Map<string, { executedTraining: number; executedEmployment: number; executionsCount: number; surveysCount: number; evaluationsCount: number; avgEvalScore: number }>();
    
    agreements.forEach((agr) => {
      const agrExecs = executions.filter(e => e.agreementId === agr.id);
      const agrSurveys = surveys.filter(s => s.agreementId === agr.id);
      const agrEvals = evaluations.filter(ev => ev.agreementId === agr.id);

      const executedTraining = agrExecs.reduce((sum, e) => sum + (e.traineesCount || 0), 0);
      const executedEmployment = agrExecs.reduce((sum, e) => sum + (e.employedCount || 0), 0);
      const avgEvalScore = agrEvals.length > 0
        ? Math.round(agrEvals.reduce((sum, ev) => sum + ev.overallScore, 0) / agrEvals.length)
        : 0;

      map.set(agr.id, {
        executedTraining,
        executedEmployment,
        executionsCount: agrExecs.length,
        surveysCount: agrSurveys.length,
        evaluationsCount: agrEvals.length,
        avgEvalScore
      });
    });

    return map;
  }, [agreements, executions, surveys, evaluations]);

  // Filtered Agreements
  const filteredAgreements = useMemo(() => {
    return agreements.filter((agr) => {
      const matchSearch = 
        agr.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agr.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agr.partnerRepresentative.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agr.domains.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSector = selectedSector === 'ALL' || agr.sector === selectedSector;
      const matchStatus = selectedStatus === 'ALL' || agr.status === selectedStatus;

      return matchSearch && matchSector && matchStatus;
    });
  }, [agreements, searchTerm, selectedSector, selectedStatus]);

  // Handle open Add
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditingAgreement(null);
    setIsAddModalOpen(true);
  };

  // Handle open Edit
  const handleOpenEdit = (agr: Agreement) => {
    setEditingAgreement(agr);
    setFormData({
      partnerName: agr.partnerName,
      sector: agr.sector,
      agreementType: agr.agreementType,
      domains: agr.domains,
      status: agr.status,
      signDate: agr.signDate,
      expiryDate: agr.expiryDate,
      collegeRepresentative: agr.collegeRepresentative,
      partnerRepresentative: agr.partnerRepresentative,
      contactPhone: agr.contactPhone,
      contactEmail: agr.contactEmail,
      city: agr.city,
      targetTrainingCount: agr.targetTrainingCount,
      targetEmploymentCount: agr.targetEmploymentCount,
      notes: agr.notes,
      attachmentsCount: agr.attachmentsCount || 1,
      documentUrl: agr.documentUrl || '',
      documentName: agr.documentName || '',
      documentSize: agr.documentSize || '',
      documentUploadDate: agr.documentUploadDate || ''
    });
    setIsAddModalOpen(true);
  };

  // Handle Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerName.trim()) {
      alert('يرجى إدخال اسم الجهة / الشريك');
      return;
    }

    if (editingAgreement) {
      const updated: Agreement = {
        ...editingAgreement,
        ...formData
      };
      onUpdateAgreement(updated);
      if (viewingAgreement && viewingAgreement.id === updated.id) {
        setViewingAgreement(updated);
      }
    } else {
      const newId = `AGR-MU-${Math.floor(100 + Math.random() * 900)}`;
      const newAgr: Agreement = {
        id: newId,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddAgreement(newAgr);
    }

    setIsAddModalOpen(false);
    setEditingAgreement(null);
  };

  // Domain Tag Toggles
  const handleToggleDomain = (domain: string) => {
    if (formData.domains.includes(domain)) {
      setFormData(prev => ({ ...prev, domains: prev.domains.filter(d => d !== domain) }));
    } else {
      setFormData(prev => ({ ...prev, domains: [...prev.domains, domain] }));
    }
  };

  const handleAddCustomDomain = () => {
    if (customDomainInput.trim() && !formData.domains.includes(customDomainInput.trim())) {
      setFormData(prev => ({ ...prev, domains: [...prev.domains, customDomainInput.trim()] }));
      setCustomDomainInput('');
    }
  };

  // Status Badge Helper - Vibrant Pastel Badges
  const getStatusBadge = (status: AgreementStatus) => {
    switch (status) {
      case 'سارية':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-400/60 shadow-2xs"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> سارية</span>;
      case 'جديدة':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-800 border border-sky-400/60 shadow-2xs"><Sparkles className="w-3.5 h-3.5 text-sky-600" /> جديدة</span>;
      case 'منتهية':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-800 border border-rose-400/60 shadow-2xs"><AlertCircle className="w-3.5 h-3.5 text-rose-600" /> منتهية</span>;
      case 'قيد التجديد':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-900 border border-amber-400/60 shadow-2xs"><Clock className="w-3.5 h-3.5 text-amber-600" /> قيد التجديد</span>;
      case 'قيد التوقيع':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-900 border border-purple-400/60 shadow-2xs"><Clock className="w-3.5 h-3.5 text-purple-600" /> قيد التوقيع</span>;
    }
  };

  // Sector Badge Helper - Vibrant Pastel Badges
  const getSectorBadge = (sector: SectorType) => {
    switch (sector) {
      case 'حكومي':
        return <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs">قطاع حكومي</span>;
      case 'خاص':
        return <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-2xs">قطاع خاص</span>;
      case 'شبه حكومي':
        return <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs">شبه حكومي</span>;
      case 'غير ربحي':
        return <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">غير ربحي</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control & Search Bar */}
      <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-agreements"
              placeholder="ابحث باسم الشريك، الرقم التعريفي، المدينة، أو مجال التعاون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Sector Filter */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">القطاع:</span>
              <select
                id="filter-sector"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">الكل</option>
                {SECTOR_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">الحالة:</span>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">الكل</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/70">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض جدول"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Agreement Button */}
            <button
              onClick={handleOpenAdd}
              id="btn-add-new-agreement"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة اتفاقية جديدة</span>
            </button>

          </div>

        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          تم العثور على <strong className="text-emerald-800 font-bold">{filteredAgreements.length}</strong> اتفاقية وشراكة
        </div>
        <div className="text-[11px] text-slate-500">
          💡 انقر على <span className="font-semibold text-emerald-700">"استعراض البيانات بالكامل"</span> لعرض كافة التفاصيل وربط الشاشات التفاعلية تلقائياً
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {filteredAgreements.map((agr) => {
            const isSelected = selectedAgreementId === agr.id;
            const metrics = agreementMetricsMap.get(agr.id) || {
              executedTraining: 0,
              executedEmployment: 0,
              executionsCount: 0,
              surveysCount: 0,
              evaluationsCount: 0,
              avgEvalScore: 0
            };

            const trainingPct = agr.targetTrainingCount > 0 
              ? Math.min(100, Math.round((metrics.executedTraining / agr.targetTrainingCount) * 100)) 
              : 0;
            const employmentPct = agr.targetEmploymentCount > 0 
              ? Math.min(100, Math.round((metrics.executedEmployment / agr.targetEmploymentCount) * 100)) 
              : 0;

            const handleCardViewDetails = (e?: React.MouseEvent) => {
              if (e) e.stopPropagation();
              onSelectAgreement(agr);
              setViewingAgreement(agr);
            };

            // Limit domain tags to max 3 with +X more badge
            const maxDomainsToShow = 3;
            const visibleDomains = agr.domains.slice(0, maxDomainsToShow);
            const extraDomainsCount = agr.domains.length - maxDomainsToShow;

            return (
              <div
                key={agr.id}
                id={`card-agreement-${agr.id}`}
                onClick={() => onSelectAgreement(agr)}
                className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer hover:-translate-y-1 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10 bg-emerald-50/20'
                    : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-600/10'
                }`}
              >
                {/* Vibrant Dynamic Accent Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Card Top & Body (flex-1 so bottom is pushed down evenly) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md">
                          {agr.id}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5 leading-snug line-clamp-2 group-hover:text-emerald-950 transition-colors" title={agr.partnerName}>
                          {agr.partnerName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {agr.agreementType}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(agr.status)}
                        {getSectorBadge(agr.sector)}
                      </div>
                    </div>

                    {/* Domains Tags (Vibrant Pastel Tags constrained to max 3 with +X more badge) */}
                    <div className="flex flex-wrap items-center gap-1.5 my-3.5 min-h-[30px]">
                      {visibleDomains.map((dom, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-teal-50/80 text-teal-800 text-[11px] font-semibold border border-teal-200/80 truncate max-w-[170px] shadow-2xs"
                          title={dom}
                        >
                          {dom}
                        </span>
                      ))}
                      {extraDomainsCount > 0 && (
                        <span 
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 text-[11px] font-bold border border-emerald-300 shadow-2xs cursor-help"
                          title={agr.domains.slice(maxDomainsToShow).join('، ')}
                        >
                          +{extraDomainsCount} أكثر
                        </span>
                      )}
                    </div>

                    {/* Dates & Location */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">التوقيع:</div>
                          <span className="font-semibold">{agr.signDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">الانتهاء:</div>
                          <span className="font-semibold">{agr.expiryDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 mt-1 pt-1 border-t border-slate-200/60">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-slate-700 font-medium truncate">المقر: {agr.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom section of the body: Progress bars & Sub-indicator badges */}
                  <div>
                    {/* Live Execution Progress Bars (Prominent Beneficiary Metrics) */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      
                      {/* Training Progress */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-amber-800 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                            مستفيدي التدريب:
                          </span>
                          <span className="font-mono text-slate-700">
                            <strong>{metrics.executedTraining}</strong> / {agr.targetTrainingCount} ({trainingPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${trainingPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Employment Progress */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-purple-800 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                            مستفيدي التوظيف:
                          </span>
                          <span className="font-mono text-slate-700">
                            <strong>{metrics.executedEmployment}</strong> / {agr.targetEmploymentCount} ({employmentPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${employmentPct}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>

                    {/* Connected Summary Badges (Enlarged, Styled, and Color-Coded) */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 select-none cursor-default"
                    >
                      {/* Executions Badge */}
                      <div 
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold shadow-2xs transition-colors"
                        title={`${metrics.executionsCount} عملية تنفيذ مسجلة`}
                      >
                        <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{metrics.executionsCount} تنفيذ</span>
                      </div>

                      {/* Surveys Badge */}
                      <div 
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200/90 text-xs font-bold shadow-2xs transition-colors"
                        title={`${metrics.surveysCount} استبيان رضا`}
                      >
                        <Smile className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{metrics.surveysCount} استبيان</span>
                      </div>

                      {/* Evaluation Badge */}
                      <div 
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-xs font-bold shadow-2xs transition-colors ${
                          metrics.evaluationsCount > 0
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-amber-50/50 text-amber-800 border-amber-200/80'
                        }`}
                        title={metrics.evaluationsCount > 0 ? `متوسط التقييم المؤسسي: ${metrics.avgEvalScore}%` : 'حالة التقييم: غير مقيم حتى الآن'}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {metrics.evaluationsCount > 0 ? `${metrics.avgEvalScore}% تقييم` : 'غير مقيم'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Card Actions Footer (Anchored to the exact bottom) */}
                <div className="bg-slate-50/90 p-3 border-t border-slate-100 flex items-center justify-between gap-2 transition-all mt-auto" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Primary Action Button (Clean, prominent, and full-width by default) */}
                  <button
                    onClick={handleCardViewDetails}
                    className="flex-1 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-700 shadow-2xs group-hover:border-emerald-500"
                    title="استعراض بيانات وتفاصيل الاتفاقية بالكامل"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600 group-hover:text-inherit" />
                    <span className="whitespace-nowrap">استعراض البيانات بالكامل</span>
                  </button>

                  {/* Secondary Action Buttons (Hidden by default, smooth animated appearance on card hover) */}
                  <div className="flex items-center gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto max-w-0 group-hover:max-w-[150px] overflow-hidden transition-all duration-300 ease-in-out">
                    {/* PDF Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfModalAgreement(agr);
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title={`معاينة وثيقة PDF المعتمدة: ${agr.documentName || 'الاتفاقية'}`}
                    >
                      <FileText className="w-4 h-4 text-rose-600" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(agr);
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="تعديل بيانات الاتفاقية"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(agr.id);
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="حذف الاتفاقية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white font-bold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">رقم الاتفاقية</th>
                  <th className="py-3 px-4">اسم الشريك والجهة</th>
                  <th className="py-3 px-4">القطاع والنوع</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">مستفيدي التدريب</th>
                  <th className="py-3 px-4">مستفيدي التوظيف</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAgreements.map((agr) => {
                  const isSelected = selectedAgreementId === agr.id;
                  const metrics = agreementMetricsMap.get(agr.id) || {
                    executedTraining: 0,
                    executedEmployment: 0,
                    executionsCount: 0,
                    surveysCount: 0,
                    evaluationsCount: 0,
                    avgEvalScore: 0
                  };

                  return (
                    <tr 
                      key={agr.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{agr.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{agr.partnerName}</div>
                        <div className="text-[11px] text-slate-500">{agr.city} - {agr.partnerRepresentative}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getSectorBadge(agr.sector)}
                          <span className="text-[10px] text-slate-500">{agr.agreementType}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(agr.status)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{agr.expiryDate}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-700">{metrics.executedTraining}</span>
                        <span className="text-slate-400 text-[10px]"> / {agr.targetTrainingCount}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-purple-700">{metrics.executedEmployment}</span>
                        <span className="text-slate-400 text-[10px]"> / {agr.targetEmploymentCount}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPdfModalAgreement(agr)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                            title="معاينة وثيقة الـ PDF الموقعة"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectAgreement(agr);
                              setViewingAgreement(agr);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 flex items-center gap-1"
                            title="استعراض البيانات بالكامل"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>استعراض</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(agr)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(agr.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 text-center mb-2">تأكيد حذف الاتفاقية</h4>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذه الاتفاقية ({deleteConfirmId})؟ سيتم تحديث كافة المؤشرات الإحصائية فوراً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteAgreement(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                نعم، احذف الاتفاقية
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Agreement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Building2 className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingAgreement ? 'تعديل بيانات الاتفاقية' : 'إضافة اتفاقية شراكة جديدة'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    الكلية التطبيقية — نظام إدارة الشراكات المؤسسية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Partner Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الجهة / الشريك الاستراتيجي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder="مثال: شركة الاتصالات السعودية (stc)، التجمع الصحي بالمجمعة..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القطاع</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as SectorType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                  >
                    {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Agreement Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الوثيقة</label>
                  <select
                    value={formData.agreementType}
                    onChange={(e) => setFormData({ ...formData, agreementType: e.target.value as AgreementType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                  >
                    {AGREEMENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاتفاقية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AgreementStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                  >
                    {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / المقر</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="مثال: المجمعة، الرياض، سدير..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Sign Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التوقيع</label>
                  <input
                    type="date"
                    value={formData.signDate}
                    onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Target Training */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المستهدف لتدريب الطلبة (عدد المستفيدين)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetTrainingCount}
                    onChange={(e) => setFormData({ ...formData, targetTrainingCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold"
                  />
                </div>

                {/* Target Employment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المستهدف لتوظيف الخريجين (عدد المستفيدين)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetEmploymentCount}
                    onChange={(e) => setFormData({ ...formData, targetEmploymentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold"
                  />
                </div>

                {/* College Representative */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ممثل الكلية</label>
                  <input
                    type="text"
                    value={formData.collegeRepresentative}
                    onChange={(e) => setFormData({ ...formData, collegeRepresentative: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Partner Representative */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ممثل الجهة الشريكة</label>
                  <input
                    type="text"
                    value={formData.partnerRepresentative}
                    onChange={(e) => setFormData({ ...formData, partnerRepresentative: e.target.value })}
                    placeholder="الاسم والمنصب لدى الشريك"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="011xxxxxxx أو 05xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="partner@company.com.sa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

              </div>

              {/* Domains Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  مجالات التعاون المتفق عليها (اختر المجالات المعنية):
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_DOMAINS.map((domain) => {
                    const isChecked = formData.domains.includes(domain);
                    return (
                      <button
                        type="button"
                        key={domain}
                        onClick={() => handleToggleDomain(domain)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isChecked
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {domain}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Domain */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="إضافة مجال تعاون مخصص آخر..."
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    إضافة المجال
                  </button>
                </div>
              </div>

              {/* PDF Document Upload Dropzone */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    إرفاق وثيقة الاتفاقية الموقعة (PDF):
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">اختياري - صيغة PDF فقط (حتى 25MB)</span>
                </label>

                {formData.documentName ? (
                  // Attached File Card
                  <div className="p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate" title={formData.documentName}>
                            {formData.documentName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold shrink-0">
                            {formData.documentSize || 'PDF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          تم تجهيز الملف للاعتماد والأرشفة الرقمية
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer">
                        استبدال
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="حذف الملف المرفق"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Dropzone Box
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      isDraggingFile
                        ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                        : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          اسحب وأفلت وثيقة الاتفاقية الموقعة (PDF) هنا، أو <span className="text-emerald-700 underline">اضغط للاختيار من جهازك</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          يدعم ملفات PDF فقط (حجم أقصى 25 ميجابايت)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نبذة عن الشراكة ونطاق العمل</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أهداف المذكرة، الالتزامات المتبادلة، والبرامج الأكاديمية المستفيدة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingAgreement ? 'حفظ التعديلات' : 'اعتماد وحفظ الاتفاقية'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Agreement Full Details Drawer / Modal */}
      {viewingAgreement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/30 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded-md font-bold">
                    {viewingAgreement.id}
                  </span>
                  {getStatusBadge(viewingAgreement.status)}
                  {getSectorBadge(viewingAgreement.sector)}
                </div>
                <h3 className="text-xl font-black text-white">{viewingAgreement.partnerName}</h3>
                <p className="text-xs text-emerald-200/90 font-medium">{viewingAgreement.agreementType}</p>
              </div>
              <button
                onClick={() => setViewingAgreement(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              
              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">تاريخ التوقيع:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.signDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">تاريخ الانتهاء:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.expiryDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">ممثل الكلية:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.collegeRepresentative}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">ممثل الشريك:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.partnerRepresentative || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">البريد الإلكتروني:</span>
                  <span className="text-emerald-700 font-mono font-bold">{viewingAgreement.contactEmail || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">هاتف التواصل:</span>
                  <span className="text-slate-900 font-mono font-bold">{viewingAgreement.contactPhone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">المقر / المدينة:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.city}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">الملحقات والوثائق:</span>
                  <strong className="text-slate-900 font-bold">{viewingAgreement.attachmentsCount || 1} وثائق رسمية مرفقة</strong>
                </div>
              </div>

              {/* Target Targets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-800 font-semibold block mb-1">المستهدف للتدريب:</span>
                  <div className="text-2xl font-black text-amber-900 font-mono">
                    {viewingAgreement.targetTrainingCount} <span className="text-xs font-normal">طالب/طالبة</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-xs text-purple-800 font-semibold block mb-1">المستهدف للتوظيف:</span>
                  <div className="text-2xl font-black text-purple-900 font-mono">
                    {viewingAgreement.targetEmploymentCount} <span className="text-xs font-normal">خريج</span>
                  </div>
                </div>
              </div>

              {/* Signed PDF Document Box */}
              <div className="bg-gradient-to-r from-rose-50 via-slate-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate" title={viewingAgreement.documentName || `وثيقة_${viewingAgreement.partnerName.replace(/\s+/g, '_')}_المعتمدة.pdf`}>
                        {viewingAgreement.documentName || `وثيقة_${viewingAgreement.partnerName.replace(/\s+/g, '_')}_المعتمدة.pdf`}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        نسخة رسمية معتمدة
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      الحجم: {viewingAgreement.documentSize || '2.4 MB'} • تاريخ الاعتماد: {viewingAgreement.documentUploadDate || viewingAgreement.signDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPdfModalAgreement(viewingAgreement)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>معاينة الوثيقة الموقعة (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Domains */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">مجالات الشراكة المعتمدة:</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingAgreement.domains.map((dom, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      ✓ {dom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {viewingAgreement.notes && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">نطاق العمل وملاحظات الوحدة:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{viewingAgreement.notes}</p>
                </div>
              )}

              {/* Quick Navigation to Connected Tabs */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-2.5">الانتقال للعمليات المرتبطة بهذا الشريك:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onSelectAgreement(viewingAgreement);
                      setViewingAgreement(null);
                      onNavigateToTab('execution');
                    }}
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex flex-col items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span>أنشطة التنفيذ</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectAgreement(viewingAgreement);
                      setViewingAgreement(null);
                      onNavigateToTab('survey');
                    }}
                    className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex flex-col items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Smile className="w-5 h-5 text-blue-600" />
                    <span>استبيانات الرضا</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectAgreement(viewingAgreement);
                      setViewingAgreement(null);
                      onNavigateToTab('evaluation');
                    }}
                    className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex flex-col items-center gap-1.5 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Award className="w-5 h-5 text-amber-600" />
                    <span>التقييم المؤسسي</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 rounded-b-3xl border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  onSelectAgreement(viewingAgreement);
                  setViewingAgreement(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow cursor-pointer"
              >
                تحديد كشريك حالي للنظام ✓
              </button>
              <button
                onClick={() => setViewingAgreement(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PDF Document Viewer Modal */}
      {pdfModalAgreement && (
        <PdfViewerModal
          agreement={pdfModalAgreement}
          onClose={() => setPdfModalAgreement(null)}
        />
      )}

    </div>
  );
};
