import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Smile, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  User, 
  Building2, 
  Sparkles, 
  CheckCircle, 
  MessageSquare, 
  TrendingUp, 
  Edit, 
  Trash2, 
  X,
  Award
} from 'lucide-react';
import { Agreement, PartnerSurvey } from '../types';
import { AgreementSelector } from './AgreementSelector';

interface SurveyTabProps {
  agreements: Agreement[];
  surveys: PartnerSurvey[];
  selectedAgreementId: string | null;
  onSelectAgreementId: (id: string | null) => void;
  onAddSurvey: (survey: PartnerSurvey) => void;
  onUpdateSurvey: (survey: PartnerSurvey) => void;
  onDeleteSurvey: (id: string) => void;
}

export const SurveyTab: React.FC<SurveyTabProps> = ({
  agreements,
  surveys,
  selectedAgreementId,
  onSelectAgreementId,
  onAddSurvey,
  onUpdateSurvey,
  onDeleteSurvey
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<PartnerSurvey | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<PartnerSurvey, 'id' | 'createdAt'> = {
    agreementId: selectedAgreementId || (agreements[0]?.id || ''),
    partnerName: agreements.find(a => a.id === selectedAgreementId)?.partnerName || (agreements[0]?.partnerName || ''),
    respondentName: '',
    respondentRole: 'مدير التدريب والتطوير المهني',
    date: new Date().toISOString().split('T')[0],
    academicPreparedness: 5,
    professionalCommitment: 5,
    collegeCoordination: 5,
    programRelevance: 5,
    satisfactionLevel: 5,
    willingToRenew: true,
    strengths: '',
    recommendations: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Active Agreement
  const activeAgreement = useMemo(() => {
    return agreements.find(a => a.id === selectedAgreementId) || null;
  }, [agreements, selectedAgreementId]);

  // Filtered Surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const matchAgreement = !selectedAgreementId || s.agreementId === selectedAgreementId;
      const matchSearch = 
        s.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.respondentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.strengths.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.recommendations.toLowerCase().includes(searchTerm.toLowerCase());

      return matchAgreement && matchSearch;
    });
  }, [surveys, selectedAgreementId, searchTerm]);

  // KPI Calculations
  const surveyMetrics = useMemo(() => {
    if (filteredSurveys.length === 0) {
      return {
        total: 0,
        avgSatisfaction: 0,
        avgPreparedness: 0,
        avgCoordination: 0,
        renewRate: 0
      };
    }

    const total = filteredSurveys.length;
    const avgSatisfaction = (filteredSurveys.reduce((sum, s) => sum + s.satisfactionLevel, 0) / total).toFixed(1);
    const avgPreparedness = (filteredSurveys.reduce((sum, s) => sum + s.academicPreparedness, 0) / total).toFixed(1);
    const avgCoordination = (filteredSurveys.reduce((sum, s) => sum + s.collegeCoordination, 0) / total).toFixed(1);
    const renewCount = filteredSurveys.filter(s => s.willingToRenew).length;
    const renewRate = Math.round((renewCount / total) * 100);

    return {
      total,
      avgSatisfaction,
      avgPreparedness,
      avgCoordination,
      renewRate
    };
  }, [filteredSurveys]);

  // Handle open Add
  const handleOpenAdd = () => {
    const defaultAgr = activeAgreement || agreements[0];
    setFormData({
      agreementId: defaultAgr?.id || '',
      partnerName: defaultAgr?.partnerName || '',
      respondentName: '',
      respondentRole: 'مدير التدريب والتطوير المهني',
      date: new Date().toISOString().split('T')[0],
      academicPreparedness: 5,
      professionalCommitment: 5,
      collegeCoordination: 5,
      programRelevance: 5,
      satisfactionLevel: 5,
      willingToRenew: true,
      strengths: '',
      recommendations: ''
    });
    setEditingSurvey(null);
    setIsModalOpen(true);
  };

  // Handle open Edit
  const handleOpenEdit = (survey: PartnerSurvey) => {
    setEditingSurvey(survey);
    setFormData({
      agreementId: survey.agreementId,
      partnerName: survey.partnerName,
      respondentName: survey.respondentName,
      respondentRole: survey.respondentRole,
      date: survey.date,
      academicPreparedness: survey.academicPreparedness,
      professionalCommitment: survey.professionalCommitment,
      collegeCoordination: survey.collegeCoordination,
      programRelevance: survey.programRelevance,
      satisfactionLevel: survey.satisfactionLevel,
      willingToRenew: survey.willingToRenew,
      strengths: survey.strengths,
      recommendations: survey.recommendations
    });
    setIsModalOpen(true);
  };

  // Handle Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.respondentName.trim()) {
      alert('يرجى إدخال اسم المسؤول لدى الشريك');
      return;
    }

    const linkedAgr = agreements.find(a => a.id === formData.agreementId);
    const partnerName = linkedAgr ? linkedAgr.partnerName : formData.partnerName;

    if (editingSurvey) {
      const updated: PartnerSurvey = {
        ...editingSurvey,
        ...formData,
        partnerName
      };
      onUpdateSurvey(updated);
    } else {
      const newId = `SRV-MU-${Math.floor(500 + Math.random() * 500)}`;
      const newSrv: PartnerSurvey = {
        id: newId,
        ...formData,
        partnerName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddSurvey(newSrv);
    }

    setIsModalOpen(false);
    setEditingSurvey(null);
  };

  // Helper star rating rendering
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1 text-amber-500 font-mono text-xs font-bold">
        <span>{score.toFixed(1)}</span>
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= Math.round(score) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Agreement Selector Header */}
      <AgreementSelector
        agreements={agreements}
        selectedAgreementId={selectedAgreementId}
        onSelectAgreementId={onSelectAgreementId}
        title="استبيانات رضا الشركاء وتقييم جودة المخرجات"
        subtitle="قياس الرضا الدوري للجهات الشريكة عن أداء طلبة الكلية التطبيقية وسلاسة التنسيق المؤسسي."
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">متوسط الرضا العام</div>
            <div className="text-xl font-black text-amber-800 mt-0.5 font-mono">
              {surveyMetrics.avgSatisfaction} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">نسبة الرغبة في التجديد</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5 font-mono">
              {surveyMetrics.renewRate}%
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">معدل جاهزية الطلبة</div>
            <div className="text-xl font-black text-blue-700 mt-0.5 font-mono">
              {surveyMetrics.avgPreparedness} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">إجمالي الردود المكتملة</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">
              {surveyMetrics.total} <span className="text-xs font-normal text-slate-400">استبيان</span>
            </div>
          </div>
        </div>

      </div>

      {/* Control Bar */}
      <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-surveys"
              placeholder="ابحث بالشريك، اسم المسؤول، أو نصوص التوصيات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            id="btn-add-new-survey"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة استبيان رضا جديد</span>
          </button>

        </div>
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSurveys.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Smile className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">لا توجد استبيانات رضا مسجلة</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              يمكنك إضافة أول استبيان رضا للجهة الشريكة لقياس جودة مخرجات الكلية.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة استبيان الآن</span>
            </button>
          </div>
        ) : (
          filteredSurveys.map((survey) => {
            return (
              <div
                key={survey.id}
                id={`card-survey-${survey.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {survey.id}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {survey.partnerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {survey.respondentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{survey.respondentName}</h4>
                          <p className="text-[11px] text-slate-500">{survey.respondentRole}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {survey.date}
                      </div>
                      {survey.willingToRenew ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" />
                          يرغب في التجديد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <ThumbsDown className="w-3 h-3 text-rose-600" />
                          متحفظ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Rubrics Grid */}
                  <div className="space-y-2 bg-slate-50/90 p-3 rounded-xl border border-slate-100 mb-4 text-xs">
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">جاهزية وكفاءة الطلبة المعرفية:</span>
                      {renderStars(survey.academicPreparedness)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">الانضباط والالتزام المهني:</span>
                      {renderStars(survey.professionalCommitment)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">جودة التنسيق والتواصل مع الكلية:</span>
                      {renderStars(survey.collegeCoordination)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">مواءمة التخصصات لسوق العمل:</span>
                      {renderStars(survey.programRelevance)}
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 font-bold">
                      <span className="text-emerald-900">مستوى الرضا العام عن الشراكة:</span>
                      {renderStars(survey.satisfactionLevel)}
                    </div>

                  </div>

                  {/* Feedback Strengths & Recommendations */}
                  <div className="space-y-2 text-xs">
                    {survey.strengths && (
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-900 block mb-0.5">🌟 نقاط القوة المذكورة:</strong>
                        <p className="text-slate-700 leading-relaxed">{survey.strengths}</p>
                      </div>
                    )}

                    {survey.recommendations && (
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        <strong className="text-amber-900 block mb-0.5">💡 التوصيات والملاحظات:</strong>
                        <p className="text-slate-700 leading-relaxed">{survey.recommendations}</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(survey)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(survey.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 text-center mb-2">تأكيد حذف الاستبيان</h4>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الاستبيان ({deleteConfirmId})؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteSurvey(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                نعم، احذف الاستبيان
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

      {/* Add / Edit Survey Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Smile className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingSurvey ? 'تعديل استبيان رضا الشريك' : 'تسجيل استبيان رضا الشريك'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    نموذج التقييم الرسمي لقياس رضا جهات التدريب والتوظيف
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
              
              {/* Select Agreement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الجهة الشريكة المعنية بالاستبيان <span className="text-rose-500">*</span>
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
                      {a.partnerName} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Respondent info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المسؤول المعبئ لدى الشريك <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.respondentName}
                    onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                    placeholder="مثال: أ. فيصل السبيعي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاستبيان</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي لدى الشريك</label>
                  <input
                    type="text"
                    value={formData.respondentRole}
                    onChange={(e) => setFormData({ ...formData, respondentRole: e.target.value })}
                    placeholder="مثال: مدير الموارد البشرية، مشرف التدريب..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              {/* 5 Rating Scales (1 to 5) */}
              <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">محاور قياس الرضا والجودة (مقياس 1 إلى 5):</h4>

                {/* Preparedness */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-medium">1. جاهزية وكفاءة طلبة الكلية المعرفية والتقنية:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, academicPreparedness: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.academicPreparedness === val
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional Commitment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-medium">2. الانضباط والالتزام والمسؤولية المهنية:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, professionalCommitment: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.professionalCommitment === val
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* College Coordination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-medium">3. جودة التنسيق والتواصل مع إدارة الشراكات بالكلية:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, collegeCoordination: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.collegeCoordination === val
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Program Relevance */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-medium">4. ملاءمة مخرجات البرامج الأكاديمية لاحتياجات سوق العمل:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, programRelevance: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.programRelevance === val
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overall Satisfaction */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-emerald-900">5. مستوى الرضا العام عن الشراكة الاستراتيجية:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormData({ ...formData, satisfactionLevel: val })}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          formData.satisfactionLevel === val
                            ? 'bg-emerald-600 text-white shadow-xs scale-105'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Willing To Renew */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-800">هل ترغب الجهة الشريكة في تجديد واستمرار الشراكة؟</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, willingToRenew: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.willingToRenew
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    نعم بالتأكيد ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, willingToRenew: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !formData.willingToRenew
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    متحفظ / لا
                  </button>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أبرز نقاط القوة والتميز</label>
                <textarea
                  rows={2}
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="انضباط الطلبة، التفاعل المؤسسي السريع، الكفاءة التقنية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                ></textarea>
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التوصيات والملاحظات التطويرية</label>
                <textarea
                  rows={2}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="المقترحات لتعزيز كفاءة المخرجات الأكاديمية والمهنية في الفصول القادمة..."
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
                  {editingSurvey ? 'حفظ التعديلات' : 'حفظ الاستبيان'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
