import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp, 
  GraduationCap, 
  Briefcase, 
  Edit, 
  Trash2, 
  Layers, 
  X,
  Sparkles,
  Building2
} from 'lucide-react';
import { Agreement, ExecutionActivity, ExecutionType, ExecutionStatus } from '../types';
import { AgreementSelector } from './AgreementSelector';

interface ExecutionTabProps {
  agreements: Agreement[];
  executions: ExecutionActivity[];
  selectedAgreementId: string | null;
  onSelectAgreementId: (id: string | null) => void;
  onAddExecution: (execution: ExecutionActivity) => void;
  onUpdateExecution: (execution: ExecutionActivity) => void;
  onDeleteExecution: (id: string) => void;
}

const EXECUTION_TYPES: ExecutionType[] = [
  'تدريب تعاوني',
  'توظيف مباشر',
  'ورشة عمل وتطوير',
  'زيارة ميدانية',
  'تطوير برنامج أكاديمي',
  'هاكاثون / مسابقة',
  'معرض مهني'
];

const EXECUTION_STATUSES: ExecutionStatus[] = ['مكتمل', 'جاري التنفيذ', 'مجدول', 'ملغي'];

export const ExecutionTab: React.FC<ExecutionTabProps> = ({
  agreements,
  executions,
  selectedAgreementId,
  onSelectAgreementId,
  onAddExecution,
  onUpdateExecution,
  onDeleteExecution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExecution, setEditingExecution] = useState<ExecutionActivity | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<ExecutionActivity, 'id' | 'createdAt'> = {
    agreementId: selectedAgreementId || (agreements[0]?.id || ''),
    partnerName: agreements.find(a => a.id === selectedAgreementId)?.partnerName || (agreements[0]?.partnerName || ''),
    title: '',
    type: 'تدريب تعاوني',
    date: new Date().toISOString().split('T')[0],
    location: 'مقر الشريك',
    traineesCount: 15,
    employedCount: 0,
    coordinatorName: 'د. عبدالله بن علي السعدون',
    status: 'مكتمل',
    achievementRate: 100,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Active Agreement object (if one is selected)
  const activeAgreement = useMemo(() => {
    return agreements.find(a => a.id === selectedAgreementId) || null;
  }, [agreements, selectedAgreementId]);

  // Filtered executions
  const filteredExecutions = useMemo(() => {
    return executions.filter((item) => {
      const matchAgreement = !selectedAgreementId || item.agreementId === selectedAgreementId;
      const matchSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'ALL' || item.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchAgreement && matchSearch && matchType && matchStatus;
    });
  }, [executions, selectedAgreementId, searchTerm, selectedType, selectedStatus]);

  // Summary Metrics for current view
  const summaryMetrics = useMemo(() => {
    const totalTrainees = filteredExecutions.reduce((sum, e) => sum + (e.traineesCount || 0), 0);
    const totalEmployed = filteredExecutions.reduce((sum, e) => sum + (e.employedCount || 0), 0);
    const completedCount = filteredExecutions.filter(e => e.status === 'مكتمل').length;
    const avgAchievement = filteredExecutions.length > 0
      ? Math.round(filteredExecutions.reduce((sum, e) => sum + (e.achievementRate || 0), 0) / filteredExecutions.length)
      : 0;

    return {
      totalActivities: filteredExecutions.length,
      totalTrainees,
      totalEmployed,
      completedCount,
      avgAchievement
    };
  }, [filteredExecutions]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultAgr = activeAgreement || agreements[0];
    setFormData({
      agreementId: defaultAgr?.id || '',
      partnerName: defaultAgr?.partnerName || '',
      title: '',
      type: 'تدريب تعاوني',
      date: new Date().toISOString().split('T')[0],
      location: defaultAgr ? `مقر ${defaultAgr.partnerName} - ${defaultAgr.city}` : 'المقر الرئيسي',
      traineesCount: 10,
      employedCount: 0,
      coordinatorName: 'د. طارق بن سليمان الباتلي',
      status: 'مكتمل',
      achievementRate: 100,
      notes: ''
    });
    setEditingExecution(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ExecutionActivity) => {
    setEditingExecution(item);
    setFormData({
      agreementId: item.agreementId,
      partnerName: item.partnerName,
      title: item.title,
      type: item.type,
      date: item.date,
      location: item.location,
      traineesCount: item.traineesCount,
      employedCount: item.employedCount,
      coordinatorName: item.coordinatorName,
      status: item.status,
      achievementRate: item.achievementRate,
      notes: item.notes
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان العملية أو النشاط');
      return;
    }

    const linkedAgr = agreements.find(a => a.id === formData.agreementId);
    const partnerName = linkedAgr ? linkedAgr.partnerName : formData.partnerName;

    if (editingExecution) {
      const updated: ExecutionActivity = {
        ...editingExecution,
        ...formData,
        partnerName
      };
      onUpdateExecution(updated);
    } else {
      const newId = `EXE-MU-${Math.floor(300 + Math.random() * 700)}`;
      const newExec: ExecutionActivity = {
        id: newId,
        ...formData,
        partnerName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddExecution(newExec);
    }

    setIsModalOpen(false);
    setEditingExecution(null);
  };

  const getStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case 'مكتمل':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> مكتمل</span>;
      case 'جاري التنفيذ':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"><Clock className="w-3 h-3 text-blue-600" /> جاري التنفيذ</span>;
      case 'مجدول':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Calendar className="w-3 h-3 text-amber-600" /> مجدول</span>;
      case 'ملغي':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300"><XCircle className="w-3 h-3 text-rose-600" /> ملغي</span>;
    }
  };

  const getTypeBadge = (type: ExecutionType) => {
    switch (type) {
      case 'تدريب تعاوني':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">تدريب تعاوني</span>;
      case 'توظيف مباشر':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">توظيف مباشر</span>;
      case 'ورشة عمل وتطوير':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">ورشة عمل</span>;
      case 'زيارة ميدانية':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-900 border border-teal-200">زيارة ميدانية</span>;
      case 'معرض مهني':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">معرض مهني</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Agreement Selector Header */}
      <AgreementSelector
        agreements={agreements}
        selectedAgreementId={selectedAgreementId}
        onSelectAgreementId={onSelectAgreementId}
        title="إدارة وتتبع عمليات التنفيذ الميداني"
        subtitle="يتم تحديث إجمالي مستفيدي التدريب والتوظيف في الشريط العلوي تلقائياً وبشكل فوري عند إضافة أي نشاط تنفيذي."
      />

      {/* KPI Overview Summary Cards for Active Scope */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">إجمالي الأنشطة المنفذة</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {summaryMetrics.totalActivities} <span className="text-xs font-normal text-slate-400">عملية</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">مستفيدي التدريب في النطاق</div>
            <div className="text-xl font-black text-amber-700 mt-0.5">
              {summaryMetrics.totalTrainees} <span className="text-xs font-normal text-slate-400">طالب/طالبة</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">مستفيدي التوظيف المباشر</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">
              {summaryMetrics.totalEmployed} <span className="text-xs font-normal text-slate-400">خريج</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">متوسط نسبة الإنجاز</div>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              {summaryMetrics.avgAchievement}%
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Action Bar */}
      <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-executions"
              placeholder="ابحث بعنوان العملية، الشريك، المقر، أو اسم المنسق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
          </div>

          {/* Filters & Add Button */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">نوع النشاط:</span>
              <select
                id="filter-exec-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">كافة الأنواع</option>
                {EXECUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">الحالة:</span>
              <select
                id="filter-exec-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">كافة الحالات</option>
                {EXECUTION_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* Add Execution Button */}
            <button
              onClick={handleOpenAdd}
              id="btn-add-new-execution"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عملية تنفيذ</span>
            </button>

          </div>

        </div>
      </div>

      {/* Execution Activities List */}
      <div className="space-y-4">
        {filteredExecutions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">لا توجد عمليات تنفيذ مطابقة</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              يمكنك إضافة عملية تنفيذ جديدة مرتبطة بالشريك لتحديث مؤشرات التدريب والتوظيف فوراً.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عملية تنفيذ الآن</span>
            </button>
          </div>
        ) : (
          filteredExecutions.map((item) => {
            return (
              <div
                key={item.id}
                id={`card-exec-${item.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  
                  {/* Left Main Details */}
                  <div className="space-y-2 flex-1">
                    
                    {/* Badges & ID */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        الشريك: {item.partnerName} ({item.agreementId})
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {/* Location, Date & Coordinator */}
                    <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        المنسق: {item.coordinatorName}
                      </span>
                    </div>

                    {/* Notes if present */}
                    {item.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                        {item.notes}
                      </p>
                    )}

                  </div>

                  {/* Right Metrics & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-r border-slate-100 pt-3 lg:pt-0 lg:pr-5">
                    
                    {/* Numbers */}
                    <div className="flex items-center gap-3">
                      
                      <div className="text-center bg-amber-50 p-2.5 rounded-xl border border-amber-200 min-w-[90px]">
                        <span className="text-[10px] text-amber-800 font-bold block">تدريب الطلبة</span>
                        <div className="text-base font-black text-amber-900 font-mono flex items-center justify-center gap-1">
                          <GraduationCap className="w-4 h-4 text-amber-600" />
                          <span>{item.traineesCount}</span>
                        </div>
                      </div>

                      <div className="text-center bg-purple-50 p-2.5 rounded-xl border border-purple-200 min-w-[90px]">
                        <span className="text-[10px] text-purple-800 font-bold block">توظيف الخريجين</span>
                        <div className="text-base font-black text-purple-900 font-mono flex items-center justify-center gap-1">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                          <span>{item.employedCount}</span>
                        </div>
                      </div>

                    </div>

                    {/* Achievement Bar */}
                    <div className="w-36 hidden sm:block">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>نسبة الإنجاز:</span>
                        <span className="font-mono">{item.achievementRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${item.achievementRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                        title="تعديل العملية"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="حذف العملية"
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 text-center mb-2">تأكيد حذف عملية التنفيذ</h4>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              هل أنت متأكد من حذف هذا النشاط التنفيذي ({deleteConfirmId})؟ سيتم تحديث أرقام مستفيدي التدريب والتوظيف في الشريط العلوي تلقائياً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteExecution(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                نعم، احذف العملية
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

      {/* Add / Edit Execution Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Activity className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingExecution ? 'تعديل نشاط التنفيذ' : 'إضافة نشاط / عملية تنفيذ جديدة'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    ربط النشاط بالاتفاقية وتحديث مستفيدي التدريب والتوظيف
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
              
              {/* Linked Agreement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاتفاقية والشريك التابع له النشاط <span className="text-rose-500">*</span>
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

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان النشاط / برنامج التنفيذ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: برنامج التدريب التعاوني لمسار سلاسل الإمداد - الفصل الثاني..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع النشاط التنفيذي</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ExecutionType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                  >
                    {EXECUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة العملية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ExecutionStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                  >
                    {EXECUTION_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التنفيذ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المقر / مكان التنفيذ</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="مثال: قاعة التدريب بمقر الشريك..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                {/* Trainees Count */}
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">
                    عدد مستفيدي التدريب (طلبة) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.traineesCount}
                    onChange={(e) => setFormData({ ...formData, traineesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-xs font-bold font-mono"
                  />
                </div>

                {/* Employed Count */}
                <div>
                  <label className="block text-xs font-bold text-purple-800 mb-1">
                    عدد مستفيدي التوظيف (خريجين)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.employedCount}
                    onChange={(e) => setFormData({ ...formData, employedCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50/40 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-xs font-bold font-mono"
                  />
                </div>

                {/* Coordinator Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">منسق العملية من الكلية / الشريك</label>
                  <input
                    type="text"
                    value={formData.coordinatorName}
                    onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                    placeholder="اسم المشرف أو المنسق"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

              </div>

              {/* Achievement Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>نسبة الإنجاز الميداني:</span>
                  <span className="font-mono text-emerald-700">{formData.achievementRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.achievementRate}
                  onChange={(e) => setFormData({ ...formData, achievementRate: parseInt(e.target.value) || 0 })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات ومخرجات النشاط</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ساعات التدريب، أسماء البرامج الأكاديمية المشاركة، والشهادات الممنوحة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                ></textarea>
              </div>

              {/* Modal Actions */}
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
                  {editingExecution ? 'حفظ التعديلات' : 'تسجيل وتحديث المؤشرات'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
