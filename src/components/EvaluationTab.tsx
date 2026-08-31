import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  User, 
  TrendingUp, 
  FileText, 
  Printer, 
  Edit, 
  Trash2, 
  X,
  Sparkles,
  Layers,
  Percent
} from 'lucide-react';
import { 
  Agreement, 
  PartnerEvaluation, 
  EvaluationClassification, 
  EvaluationDecision 
} from '../types';
import { AgreementSelector } from './AgreementSelector';

interface EvaluationTabProps {
  agreements: Agreement[];
  evaluations: PartnerEvaluation[];
  selectedAgreementId: string | null;
  onSelectAgreementId: (id: string | null) => void;
  onAddEvaluation: (evaluation: PartnerEvaluation) => void;
  onUpdateEvaluation: (evaluation: PartnerEvaluation) => void;
  onDeleteEvaluation: (id: string) => void;
}

const CLASSIFICATIONS: EvaluationClassification[] = [
  'شريك استراتيجي متميز (أ)',
  'شريك فعال (ب)',
  'شريك يحتاج تحسين (ج)',
  'شريك غير نشط (د)'
];

const DECISIONS: EvaluationDecision[] = [
  'تجديد الاتفاقية وتوسيع النطاق',
  'الاستمرار مع المتابعة الدورية',
  'إعادة توجيه وتحديث خطة العمل',
  'إنهاء أو عدم تجديد الشراكة'
];

export const EvaluationTab: React.FC<EvaluationTabProps> = ({
  agreements,
  evaluations,
  selectedAgreementId,
  onSelectAgreementId,
  onAddEvaluation,
  onUpdateEvaluation,
  onDeleteEvaluation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<PartnerEvaluation | null>(null);
  const [viewingEvaluation, setViewingEvaluation] = useState<PartnerEvaluation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    agreementId: selectedAgreementId || (agreements[0]?.id || ''),
    partnerName: agreements.find(a => a.id === selectedAgreementId)?.partnerName || (agreements[0]?.partnerName || ''),
    evaluatorName: 'د. عبدالله بن علي السعدون (مساعد رئيس الكلية التطبيقية)',
    date: new Date().toISOString().split('T')[0],
    period: 'التقييم السنوي للعام الجامعي 1446-1447هـ',
    complianceWithTerms: 5,
    trainingEnvironmentQuality: 5,
    mentorshipQuality: 5,
    employmentConversion: 4,
    responsiveness: 5,
    notes: 'شريك استراتيجي متميز يفي بكافة التزامات التدريب والتوظيف بنجاح.'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Active Agreement
  const activeAgreement = useMemo(() => {
    return agreements.find(a => a.id === selectedAgreementId) || null;
  }, [agreements, selectedAgreementId]);

  // Dynamic Score Calculation from criteria weights:
  // Compliance (20%) + Environment (20%) + Mentorship (20%) + Employment (25%) + Responsiveness (15%)
  const calculateOverall = (
    comp: number,
    env: number,
    mentor: number,
    emp: number,
    resp: number
  ) => {
    const raw = (comp * 20 + env * 20 + mentor * 20 + emp * 25 + resp * 15) / 5;
    const score = Math.round(raw);
    let classification: EvaluationClassification = 'شريك استراتيجي متميز (أ)';
    let decision: EvaluationDecision = 'تجديد الاتفاقية وتوسيع النطاق';

    if (score >= 90) {
      classification = 'شريك استراتيجي متميز (أ)';
      decision = 'تجديد الاتفاقية وتوسيع النطاق';
    } else if (score >= 80) {
      classification = 'شريك فعال (ب)';
      decision = 'الاستمرار مع المتابعة الدورية';
    } else if (score >= 65) {
      classification = 'شريك يحتاج تحسين (ج)';
      decision = 'إعادة توجيه وتحديث خطة العمل';
    } else {
      classification = 'شريك غير نشط (د)';
      decision = 'إنهاء أو عدم تجديد الشراكة';
    }

    return { score, classification, decision };
  };

  const currentComputed = calculateOverall(
    formData.complianceWithTerms,
    formData.trainingEnvironmentQuality,
    formData.mentorshipQuality,
    formData.employmentConversion,
    formData.responsiveness
  );

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((ev) => {
      const matchAgreement = !selectedAgreementId || ev.agreementId === selectedAgreementId;
      const matchSearch = 
        ev.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClassification === 'ALL' || ev.classification === selectedClassification;

      return matchAgreement && matchSearch && matchClass;
    });
  }, [evaluations, selectedAgreementId, searchTerm, selectedClassification]);

  // Overall KPI Metrics
  const evaluationKPIs = useMemo(() => {
    if (filteredEvaluations.length === 0) {
      return { total: 0, avgScore: 0, strategicCount: 0, activeCount: 0, needsImprovementCount: 0 };
    }
    const total = filteredEvaluations.length;
    const avgScore = Math.round(filteredEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / total);
    const strategicCount = filteredEvaluations.filter(e => e.classification.includes('(أ)')).length;
    const activeCount = filteredEvaluations.filter(e => e.classification.includes('(ب)')).length;
    const needsImprovementCount = filteredEvaluations.filter(e => e.classification.includes('(ج)') || e.classification.includes('(د)')).length;

    return { total, avgScore, strategicCount, activeCount, needsImprovementCount };
  }, [filteredEvaluations]);

  // Open Add
  const handleOpenAdd = () => {
    const defaultAgr = activeAgreement || agreements[0];
    setFormData({
      agreementId: defaultAgr?.id || '',
      partnerName: defaultAgr?.partnerName || '',
      evaluatorName: 'د. طارق بن سليمان الباتلي (رئيس وحدة الشراكات والتدريب)',
      date: new Date().toISOString().split('T')[0],
      period: 'التقييم السنوي للعام الجامعي 1446-1447هـ',
      complianceWithTerms: 5,
      trainingEnvironmentQuality: 5,
      mentorshipQuality: 5,
      employmentConversion: 4,
      responsiveness: 5,
      notes: 'شريك استراتيجي متميز يفي بكافة التزامات التدريب والتوظيف بنجاح.'
    });
    setEditingEvaluation(null);
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (ev: PartnerEvaluation) => {
    setEditingEvaluation(ev);
    setFormData({
      agreementId: ev.agreementId,
      partnerName: ev.partnerName,
      evaluatorName: ev.evaluatorName,
      date: ev.date,
      period: ev.period,
      complianceWithTerms: ev.complianceWithTerms,
      trainingEnvironmentQuality: ev.trainingEnvironmentQuality,
      mentorshipQuality: ev.mentorshipQuality,
      employmentConversion: ev.employmentConversion,
      responsiveness: ev.responsiveness,
      notes: ev.notes
    });
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedAgr = agreements.find(a => a.id === formData.agreementId);
    const partnerName = linkedAgr ? linkedAgr.partnerName : formData.partnerName;

    const { score, classification, decision } = calculateOverall(
      formData.complianceWithTerms,
      formData.trainingEnvironmentQuality,
      formData.mentorshipQuality,
      formData.employmentConversion,
      formData.responsiveness
    );

    if (editingEvaluation) {
      const updated: PartnerEvaluation = {
        ...editingEvaluation,
        ...formData,
        partnerName,
        overallScore: score,
        classification,
        decision
      };
      onUpdateEvaluation(updated);
    } else {
      const newId = `EVL-MU-${Math.floor(700 + Math.random() * 300)}`;
      const newEv: PartnerEvaluation = {
        id: newId,
        ...formData,
        partnerName,
        overallScore: score,
        classification,
        decision,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddEvaluation(newEv);
    }

    setIsModalOpen(false);
    setEditingEvaluation(null);
  };

  // Badge helpers
  const getClassificationBadge = (cls: EvaluationClassification) => {
    if (cls.includes('(أ)')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs">
          <Award className="w-3.5 h-3.5" />
          {cls}
        </span>
      );
    } else if (cls.includes('(ب)')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          {cls}
        </span>
      );
    } else if (cls.includes('(ج)')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {cls}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          {cls}
        </span>
      );
    }
  };

  const getDecisionBadge = (decision: EvaluationDecision) => {
    switch (decision) {
      case 'تجديد الاتفاقية وتوسيع النطاق':
        return <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">قرار: تجديد وتوسيع النطاق ✓</span>;
      case 'الاستمرار مع المتابعة الدورية':
        return <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">قرار: استمرار ومتابعة دورية</span>;
      case 'إعادة توجيه وتحديث خطة العمل':
        return <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">قرار: تحديث وتصحيح الخطة</span>;
      case 'إنهاء أو عدم تجديد الشراكة':
        return <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">قرار: إنهاء الشراكة</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Agreement Selector Header */}
      <AgreementSelector
        agreements={agreements}
        selectedAgreementId={selectedAgreementId}
        onSelectAgreementId={onSelectAgreementId}
        title="التقييم المؤسسي الدوري للشركاء"
        subtitle="نموذج تقييم الأداء والالتزام ببنود الاتفاقيات وجودة البيئة التدريبية ومعدلات توظيف الخريجين."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">متوسط الدرجة العامة</div>
            <div className="text-xl font-black text-amber-800 mt-0.5 font-mono">
              {evaluationKPIs.avgScore}%
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">شركاء استراتيجيون (فئة أ)</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              {evaluationKPIs.strategicCount} <span className="text-xs font-normal text-slate-400">جهة</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">شركاء فعالون (فئة ب)</div>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              {evaluationKPIs.activeCount} <span className="text-xs font-normal text-slate-400">جهة</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">إجمالي تقارير التقييم</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">
              {evaluationKPIs.total} <span className="text-xs font-normal text-slate-400">تقرير</span>
            </div>
          </div>
        </div>

      </div>

      {/* Control Bar */}
      <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-evaluations"
              placeholder="ابحث بالشريك، المقيم، الفترة، أو التوصية والقرار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Classification Filter */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">التصنيف:</span>
              <select
                id="filter-eval-classification"
                value={selectedClassification}
                onChange={(e) => setSelectedClassification(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">كافة الفئات</option>
                {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              id="btn-add-new-evaluation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقييم جديد للشريك</span>
            </button>

          </div>

        </div>
      </div>

      {/* Evaluations Cards */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">لا توجد تقييمات مسجلة</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              يمكنك تقييم أداء الشريك وتحديد التصنيف المؤسسي وتوصية التجديد الآن.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إجراء تقييم الآن</span>
            </button>
          </div>
        ) : (
          filteredEvaluations.map((ev) => {
            return (
              <div
                key={ev.id}
                id={`card-eval-${ev.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-5">
                  
                  {/* Left Main */}
                  <div className="space-y-3 flex-1">
                    
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {ev.id}
                      </span>
                      {getClassificationBadge(ev.classification)}
                      {getDecisionBadge(ev.decision)}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {ev.partnerName}
                        <span className="font-mono text-xs font-normal text-slate-400">({ev.agreementId})</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{ev.period}</p>
                    </div>

                    {/* Criteria Rubric Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">الالتزام بالبنود</span>
                        <span className="text-xs font-black text-slate-800">{ev.complianceWithTerms} / 5</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">البيئة التدريبية</span>
                        <span className="text-xs font-black text-slate-800">{ev.trainingEnvironmentQuality} / 5</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">كفاءة الإشراف</span>
                        <span className="text-xs font-black text-slate-800">{ev.mentorshipQuality} / 5</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">جدية التوظيف</span>
                        <span className="text-xs font-black text-purple-700">{ev.employmentConversion} / 5</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">سرعة التجاوب</span>
                        <span className="text-xs font-black text-slate-800">{ev.responsiveness} / 5</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {ev.notes && (
                      <p className="text-xs text-slate-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60 leading-relaxed">
                        <strong className="text-emerald-950 font-bold ml-1">توصية ومبررات الوحدة:</strong>
                        {ev.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        المقيم: {ev.evaluatorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        تاريخ الاعتماد: {ev.date}
                      </span>
                    </div>

                  </div>

                  {/* Right Overall Score Block & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-r border-slate-100 pt-3 lg:pt-0 lg:pr-5 min-w-[160px]">
                    
                    {/* Big Score Dial */}
                    <div className="text-center p-3 rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200 w-full lg:w-32 shadow-inner">
                      <span className="text-[10px] font-bold text-emerald-800 block">الدرجة الإجمالية</span>
                      <div className="text-3xl font-black text-emerald-900 font-mono my-0.5">
                        {ev.overallScore}%
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">معدل الامتثال</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                        title="تعديل التقييم"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(ev.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                        title="حذف التقييم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 text-center mb-2">تأكيد حذف التقييم</h4>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا التقييم ({deleteConfirmId})؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteEvaluation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                نعم، احذف التقييم
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

      {/* Add / Edit Evaluation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingEvaluation ? 'تعديل تقييم الشريك' : 'إجراء تقييم مؤسسي جديد للشريك'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    وحدة الشراكات والتدريب — الكلية التطبيقية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Partner Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الجهة الشريكة المراد تقييمها <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.agreementId}
                  onChange={(e) => {
                    const selAgr = agreements.find(a => a.id === e.target.value);
                    setFormData({
                      ...formData,
                      agreementId: e.target.value,
                      partnerName: selAgr?.partnerName || ''
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                >
                  {agreements.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.partnerName} ({a.id}) - {a.sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* Evaluator, Period, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المقيم / اللجنة</label>
                  <input
                    type="text"
                    required
                    value={formData.evaluatorName}
                    onChange={(e) => setFormData({ ...formData, evaluatorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التقييم</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">فترة التقييم</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="مثال: التقييم السنوي 1446هـ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Rubric Elements 1-5 */}
              <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">بنود ومحاور التقييم الوزاري (مقياس 1 إلى 5):</h4>

                {/* 1. Compliance (20%) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-800 font-semibold block">1. الالتزام ببنود مذكرة التفاهم (وزن 20%):</span>
                    <span className="text-[11px] text-slate-500">توفير المقاعد التدريبية المعتمدة والتنسيق المنتظم</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, complianceWithTerms: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.complianceWithTerms === val
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Environment (20%) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-800 font-semibold block">2. جودة وتجهيز البيئة التدريبية (وزن 20%):</span>
                    <span className="text-[11px] text-slate-500">توفر الأدوات والأنظمة واشتراطات السلامة المهنية</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, trainingEnvironmentQuality: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.trainingEnvironmentQuality === val
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mentorship (20%) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-800 font-semibold block">3. كفاءة الإشراف والمتابعة الميدانية (وزن 20%):</span>
                    <span className="text-[11px] text-slate-500">تخصيص مشرفين متخصصين وتعبئة تقارير الأداء</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, mentorshipQuality: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.mentorshipQuality === val
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Employment (25%) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-purple-900 font-bold block">4. جدية استقطاب وتوظيف الخريجين (وزن 25%):</span>
                    <span className="text-[11px] text-slate-500">تقديم عروض وظيفية فعلية وتسهيل مقابلات التعيين</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, employmentConversion: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.employmentConversion === val
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Responsiveness (15%) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-800 font-semibold block">5. سرعة التجاوب والتعاون الإداري (وزن 15%):</span>
                    <span className="text-[11px] text-slate-500">الرد السريع على الخطابات وحل التحديات الميدانية</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, responsiveness: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.responsiveness === val
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Dynamic Live Grade Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shadow-md">
                <div>
                  <div className="text-xs text-emerald-200 font-bold">النتيجة والتصنيف المحسوب لحظياً:</div>
                  <div className="text-2xl font-black font-mono text-amber-300">
                    {currentComputed.score}% — {currentComputed.classification}
                  </div>
                  <div className="text-xs text-emerald-100 mt-0.5">
                    التوصية المؤسسية: <strong>{currentComputed.decision}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 text-amber-300">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبررات التقييم والتوصية النهائية</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات تفصيلية تدعم قرار اللجنة بشأن الشراكة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingEvaluation ? 'حفظ التعديلات' : 'اعتماد التقييم المؤسسي'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
