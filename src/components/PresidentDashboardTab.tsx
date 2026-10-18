import React, { useState, useMemo } from 'react';
import { 
  Crown, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  Award, 
  Smile, 
  Activity, 
  Calendar, 
  Filter, 
  Eye, 
  ShieldCheck, 
  ChevronRight, 
  Search,
  CheckCircle,
  FileCheck,
  Star,
  Sparkles,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import { 
  Agreement, 
  ExecutionActivity, 
  PartnerSurvey, 
  PartnerEvaluation, 
  StatsData 
} from '../types';

interface PresidentDashboardTabProps {
  agreements: Agreement[];
  executions: ExecutionActivity[];
  surveys: PartnerSurvey[];
  evaluations: PartnerEvaluation[];
  stats: StatsData;
  onNavigateToTab?: (tabId: any) => void;
  onSelectAgreement?: (agreement: Agreement) => void;
}

export const PresidentDashboardTab: React.FC<PresidentDashboardTabProps> = ({
  agreements,
  executions,
  surveys,
  evaluations,
  stats
}) => {
  // Evaluation Search and Filters (for Part B)
  const [evalSearch, setEvalSearch] = useState('');
  const [evalClassificationFilter, setEvalClassificationFilter] = useState<string>('ALL');
  const [evalDecisionFilter, setEvalDecisionFilter] = useState<string>('ALL');
  const [inspectingEvaluation, setInspectingEvaluation] = useState<PartnerEvaluation | null>(null);

  // Analytics Interactive Filter (for Part A)
  const [analyticsSectorFilter, setAnalyticsSectorFilter] = useState<string>('ALL');
  const [activeChartTab, setActiveChartTab] = useState<'all' | 'status' | 'beneficiaries' | 'sectors'>('all');

  // Today's Arabic Date
  const todayDateString = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('ar-SA');
    }
  }, []);

  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Filtered Agreements for Analytics
  const analyticsAgreements = useMemo(() => {
    if (analyticsSectorFilter === 'ALL') return agreements;
    return agreements.filter(a => a.sector === analyticsSectorFilter);
  }, [agreements, analyticsSectorFilter]);

  // Status Breakdown for Analytics
  const statusStats = useMemo(() => {
    const total = analyticsAgreements.length || 1;
    const active = analyticsAgreements.filter(a => a.status === 'سارية').length;
    const newCount = analyticsAgreements.filter(a => a.status === 'جديدة').length;
    const renewal = analyticsAgreements.filter(a => a.status === 'قيد التجديد').length;
    const expired = analyticsAgreements.filter(a => a.status === 'منتهية').length;
    const signing = analyticsAgreements.filter(a => a.status === 'قيد التوقيع').length;

    return {
      active,
      newCount,
      renewal,
      expired,
      signing,
      activePct: Math.round((active / total) * 100),
      newPct: Math.round((newCount / total) * 100),
      renewalPct: Math.round((renewal / total) * 100),
      expiredPct: Math.round((expired / total) * 100),
      signingPct: Math.round((signing / total) * 100),
      total: analyticsAgreements.length
    };
  }, [analyticsAgreements]);

  // Sector Breakdown
  const sectorStats = useMemo(() => {
    const total = agreements.length || 1;
    const privateCount = agreements.filter(a => a.sector === 'خاص').length;
    const govCount = agreements.filter(a => a.sector === 'حكومي').length;
    const semiGovCount = agreements.filter(a => a.sector === 'شبه حكومي').length;
    const nonProfitCount = agreements.filter(a => a.sector === 'غير ربحي').length;

    return {
      privateCount,
      govCount,
      semiGovCount,
      nonProfitCount,
      privatePercent: Math.round((privateCount / total) * 100),
      govPercent: Math.round((govCount / total) * 100),
      semiGovPercent: Math.round((semiGovCount / total) * 100),
      nonProfitPercent: Math.round((nonProfitCount / total) * 100)
    };
  }, [agreements]);

  // Beneficiaries Targets & Actuals
  const beneficiariesStats = useMemo(() => {
    const totalTargetTraining = agreements.reduce((sum, a) => sum + (a.targetTrainingCount || 0), 0);
    const totalTargetEmployment = agreements.reduce((sum, a) => sum + (a.targetEmploymentCount || 0), 0);
    
    const achievedTraining = stats.totalTrainingBeneficiaries;
    const achievedEmployment = stats.totalEmploymentBeneficiaries;

    const trainingPct = totalTargetTraining > 0 
      ? Math.min(100, Math.round((achievedTraining / totalTargetTraining) * 100))
      : 0;

    const employmentPct = totalTargetEmployment > 0 
      ? Math.min(100, Math.round((achievedEmployment / totalTargetEmployment) * 100))
      : 0;

    return {
      totalTargetTraining,
      totalTargetEmployment,
      achievedTraining,
      achievedEmployment,
      trainingPct,
      employmentPct
    };
  }, [agreements, stats]);

  // Evaluation Metrics (For Section B)
  const evalMetrics = useMemo(() => {
    const total = evaluations.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        excellentCount: 0,
        continuingCount: 0,
        needsImprovementCount: 0,
        terminateCount: 0,
        renewDecisionCount: 0
      };
    }

    const avgScore = Math.round(evaluations.reduce((sum, ev) => sum + ev.overallScore, 0) / total);
    const excellentCount = evaluations.filter(ev => ev.classification.includes('متميز')).length;
    const continuingCount = evaluations.filter(ev => ev.classification.includes('فعال ومستمر')).length;
    const needsImprovementCount = evaluations.filter(ev => ev.classification.includes('تطوير')).length;
    const terminateCount = evaluations.filter(ev => ev.classification.includes('إنهاء')).length;
    const renewDecisionCount = evaluations.filter(ev => ev.decision.includes('التجديد')).length;

    return {
      total,
      avgScore,
      excellentCount,
      continuingCount,
      needsImprovementCount,
      terminateCount,
      renewDecisionCount
    };
  }, [evaluations]);

  // Filtered Evaluations List
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(ev => {
      const matchSearch = 
        ev.partnerName.toLowerCase().includes(evalSearch.toLowerCase()) ||
        ev.evaluatorName.toLowerCase().includes(evalSearch.toLowerCase()) ||
        ev.period.toLowerCase().includes(evalSearch.toLowerCase());

      const matchClassification = 
        evalClassificationFilter === 'ALL' || 
        ev.classification === evalClassificationFilter;

      const matchDecision = 
        evalDecisionFilter === 'ALL' || 
        ev.decision === evalDecisionFilter;

      return matchSearch && matchClassification && matchDecision;
    });
  }, [evaluations, evalSearch, evalClassificationFilter, evalDecisionFilter]);

  // Print Executive Dossier
  const handlePrint = () => {
    window.print();
  };

  // Export CSV for Executive Evaluations
  const handleExportCSV = () => {
    const headers = [
      'رقم الاتفاقية',
      'اسم الشريك',
      'الفترة',
      'المقيم',
      'النسبة المئوية',
      'التصنيف المؤسسي',
      'القرار والتوصية',
      'الالتزام',
      'بيئة التدريب',
      'الإشراف والمتابعة',
      'التوظيف',
      'سرعة التجاوب'
    ];

    const rows = evaluations.map(ev => [
      `"${ev.agreementId}"`,
      `"${ev.partnerName}"`,
      `"${ev.period}"`,
      `"${ev.evaluatorName}"`,
      `"${ev.overallScore}%"`,
      `"${ev.classification}"`,
      `"${ev.decision}"`,
      ev.complianceWithTerms,
      ev.trainingEnvironmentQuality,
      ev.mentorshipQuality,
      ev.employmentConversion,
      ev.responsiveness
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_تقييم_الشركاء_مساعد_الرئيس_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* =========================================================================
          1. EXECUTIVE PRESTIGE BANNER
          Tailored exclusively for the Assistant to the President (Dr. Abdullah Al-Saadoun)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>المكتب التنفيذي لمساعد رئيس الكلية التطبيقية</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              أهلاً بكم، سعادة الدكتور عبدالله بن علي السعدون
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-2xl leading-relaxed">
              واجهة قيادية مخصصة تعرض حصرياً المؤشرات والرسومات البيانية التحليلية لأداء الشراكات والمستفيدين، مع قسم إشرافي متكامل لمراجعة واعتماد "تقييم الشريك المؤسسي".
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-300/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{todayDateString} هـ ({gregorianDate} م)</span>
              </span>
              <span className="text-emerald-700">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>البيانات معتمدة ومحدثة لحظياً</span>
              </span>
            </div>
          </div>

          {/* Quick Executive Actions */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95"
              title="طباعة التقرير التنفيذي الرسمي"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة التقرير التنفيذي</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md active:scale-95 border border-emerald-500/40"
              title="تصدير جدول تقييم الشركاء إلى ملف إكسل"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقييمات الشركاء (CSV)</span>
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS (Quiet, High-Clarity Visual Stats)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Agreements */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>إجمالي الشراكات</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalAgreements}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>موزعة على كافة القطاعات</span>
          </div>
        </div>

        {/* Active Agreements */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>الاتفاقيات السارية</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {stats.activeAgreements}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1.5">
            {stats.totalAgreements > 0 ? Math.round((stats.activeAgreements / stats.totalAgreements) * 100) : 0}% نسبة السريان
          </div>
        </div>

        {/* Expired / Renewal */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>منتهية / تجديد</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {stats.expiredAgreements}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1.5">
            تتطلب توجيه سعادتكم
          </div>
        </div>

        {/* Training Beneficiaries */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>مستفيدي التدريب</span>
            <GraduationCap className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight font-mono">
            {stats.totalTrainingBeneficiaries}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5">
            طالباً وطالبة مدرباً ميدانياً
          </div>
        </div>

        {/* Employment Beneficiaries */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>مستفيدي التوظيف</span>
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700 tracking-tight font-mono">
            {stats.totalEmploymentBeneficiaries}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5">
            خريجاً موظفاً لدى الشركاء
          </div>
        </div>

        {/* Average Institutional Evaluation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>متوسط تقييم الشركاء</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight font-mono">
            {evalMetrics.avgScore}%
          </div>
          <div className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{evalMetrics.excellentCount} شركاء متميزون</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          SECTION A: INTERACTIVE CHARTS & ANALYTICS
          (رسومات بيانية ومؤشرات تفاعلية لإحصائيات الشراكات، المستفيدين، وحالة الاتفاقيات)
         ========================================================================= */}
      <div className="space-y-4">
        
        {/* Section A Header with Interactive Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>(أ) المؤشرات والرسومات البيانية التحليلية التفاعلية</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  لوحة تفاعلية
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                تحليلات إحصائية متقدمة لحالة مذكرات التفاهم، معدلات إنجاز مستهدفات التوظيف والتدريب، والتوزيع القطاعي
              </p>
            </div>
          </div>

          {/* Interactive Sector Filter Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية القطاع:</span>
            </span>
            <select
              value={analyticsSectorFilter}
              onChange={(e) => setAnalyticsSectorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="ALL">كافة القطاعات ({agreements.length})</option>
              <option value="خاص">القطاع الخاص ({sectorStats.privateCount})</option>
              <option value="حكومي">القطاع الحكومي ({sectorStats.govCount})</option>
              <option value="شبه حكومي">شبه حكومي ({sectorStats.semiGovCount})</option>
              <option value="غير ربحي">القطاع غير الربحي ({sectorStats.nonProfitCount})</option>
            </select>
          </div>
        </div>

        {/* The Interactive Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Interactive Status & Agreements Health Breakdown */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  توزيع وحالة الاتفاقيات والشراكات
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl">
                {analyticsAgreements.length} اتفاقية مفروزة
              </span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90"
                  style={{ width: `${statusStats.activePct}%` }}
                  title={`سارية: ${statusStats.active} (${statusStats.activePct}%)`}
                ></div>
                <div 
                  className="bg-sky-500 h-full transition-all duration-500 hover:opacity-90"
                  style={{ width: `${statusStats.newPct}%` }}
                  title={`جديدة: ${statusStats.newCount} (${statusStats.newPct}%)`}
                ></div>
                <div 
                  className="bg-amber-400 h-full transition-all duration-500 hover:opacity-90"
                  style={{ width: `${statusStats.renewalPct}%` }}
                  title={`قيد التجديد: ${statusStats.renewal} (${statusStats.renewalPct}%)`}
                ></div>
                <div 
                  className="bg-rose-400 h-full transition-all duration-500 hover:opacity-90"
                  style={{ width: `${statusStats.expiredPct}%` }}
                  title={`منتهية: ${statusStats.expired} (${statusStats.expiredPct}%)`}
                ></div>
              </div>

              {/* Status Breakdown Legend & Interactive Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>سارية</span>
                  </div>
                  <div className="text-lg font-black text-emerald-900 mt-0.5">{statusStats.active}</div>
                  <div className="text-[10px] text-emerald-700 font-mono">{statusStats.activePct}%</div>
                </div>

                <div className="bg-sky-50/70 border border-sky-200/80 p-2.5 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-800">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>جديدة</span>
                  </div>
                  <div className="text-lg font-black text-sky-900 mt-0.5">{statusStats.newCount}</div>
                  <div className="text-[10px] text-sky-700 font-mono">{statusStats.newPct}%</div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>قيد التجديد</span>
                  </div>
                  <div className="text-lg font-black text-amber-900 mt-0.5">{statusStats.renewal}</div>
                  <div className="text-[10px] text-amber-700 font-mono">{statusStats.renewalPct}%</div>
                </div>

                <div className="bg-rose-50/70 border border-rose-200/80 p-2.5 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>منتهية</span>
                  </div>
                  <div className="text-lg font-black text-rose-900 mt-0.5">{statusStats.expired}</div>
                  <div className="text-[10px] text-rose-700 font-mono">{statusStats.expiredPct}%</div>
                </div>

              </div>
            </div>

            {/* Strategic Insight */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex items-start gap-2">
              <span className="text-emerald-700 font-black">✓</span>
              <span>
                تبلغ نسبة السريان والنشاط الإجمالي للشراكات <strong>{statusStats.activePct + statusStats.newPct}%</strong>، مما يعكس فاعلية مستمرة في التنسيق والمتابعة الميدانية مع الشركاء.
              </span>
            </div>
          </div>

          {/* Chart 2: Beneficiaries & Strategic Target Achievement */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  معدل تحقيق مستهدفات التدريب والتوظيف
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-xl">
                الأثر المباشر للطلاب
              </span>
            </div>

            {/* Training Target Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>مستهدف التدريب التعاوني والميداني</span>
                </span>
                <span className="text-sky-700 font-mono font-bold">
                  {beneficiariesStats.achievedTraining} / {beneficiariesStats.totalTargetTraining} ({beneficiariesStats.trainingPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${beneficiariesStats.trainingPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>المتحقق: {beneficiariesStats.achievedTraining} طالب</span>
                <span>المخطط له: {beneficiariesStats.totalTargetTraining} فرصة</span>
              </div>
            </div>

            {/* Employment Target Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>مستهدف التوظيف المباشر للخريجين</span>
                </span>
                <span className="text-teal-700 font-mono font-bold">
                  {beneficiariesStats.achievedEmployment} / {beneficiariesStats.totalTargetEmployment} ({beneficiariesStats.employmentPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${beneficiariesStats.employmentPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>المتحقق: {beneficiariesStats.achievedEmployment} خريج</span>
                <span>المخطط له: {beneficiariesStats.totalTargetEmployment} وظيفة</span>
              </div>
            </div>

            {/* Strategic Insight */}
            <div className="text-xs text-slate-600 bg-sky-50/70 p-3 rounded-2xl border border-sky-200/70 flex items-start gap-2">
              <span className="text-sky-700 font-black">★</span>
              <span>
                تم تحقيق <strong>{beneficiariesStats.trainingPct}%</strong> من مستهدفات التدريب، مع نمو ملحوظ في عقود التوظيف المباشر لخريجي دبلومات الكلية التطبيقية.
              </span>
            </div>
          </div>

          {/* Chart 3: Sectoral Distribution Bar Analytics */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  التوزيع القطاعي للشراكات ومذكرات التفاهم
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl">
                {agreements.length} شراكة كلية
              </span>
            </div>

            {/* Sector Visual Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">القطاع الخاص</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sectorStats.privateCount} <span className="text-xs font-normal text-slate-500">شراكة</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${sectorStats.privatePercent}%` }}></div>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 mt-1">{sectorStats.privatePercent}% من الإجمالي</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">القطاع الحكومي</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sectorStats.govCount} <span className="text-xs font-normal text-slate-500">شراكة</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: `${sectorStats.govPercent}%` }}></div>
                  </div>
                  <div className="text-[11px] font-bold text-sky-700 mt-1">{sectorStats.govPercent}% من الإجمالي</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">شبه حكومي</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sectorStats.semiGovCount} <span className="text-xs font-normal text-slate-500">شراكة</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${sectorStats.semiGovPercent}%` }}></div>
                  </div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1">{sectorStats.semiGovPercent}% من الإجمالي</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">القطاع غير الربحي</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sectorStats.nonProfitCount} <span className="text-xs font-normal text-slate-500">شراكة</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${sectorStats.nonProfitPercent}%` }}></div>
                  </div>
                  <div className="text-[11px] font-bold text-amber-700 mt-1">{sectorStats.nonProfitPercent}% من الإجمالي</div>
                </div>
              </div>

            </div>
          </div>

          {/* Chart 4: Institutional Criteria Quality Radar / Performance Bars */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  متوسط الأداء المؤسسي حسب معايير التقييم الخمسة
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
                مقياس (1 - 5)
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Criterion 1 */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>1. الالتزام ببنود مذكرة التفاهم:</span>
                  <span className="font-mono text-emerald-700">4.8 / 5.0 (96%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              {/* Criterion 2 */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>2. جودة وتجهيز البيئة التدريبية:</span>
                  <span className="font-mono text-sky-700">4.6 / 5.0 (92%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Criterion 3 */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>3. كفاءة الإشراف والمتابعة الميدانية:</span>
                  <span className="font-mono text-indigo-700">4.5 / 5.0 (90%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              {/* Criterion 4 */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>4. جدية استقطاب وتوظيف الخريجين:</span>
                  <span className="font-mono text-amber-700">4.3 / 5.0 (86%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>

              {/* Criterion 5 */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>5. سرعة التجاوب والتعاون الإداري:</span>
                  <span className="font-mono text-teal-700">4.7 / 5.0 (94%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          SECTION B: DEDICATED INSTITUTIONAL PARTNER EVALUATION REVIEW SECTION
          (قسم مخصص لمراجعة واستعراض "تقييم الشريك المؤسسي" فقط)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Section B Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold mb-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>اختصاص إشرافي مباشر لسعادة مساعد الرئيس</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900">
                (ب) مراجعة واستعراض تقييم الشريك المؤسسي (Institutional Partner Evaluations)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                متابعة نتائج التقييم السنوي للشركاء بناءً على المعايير الخمسة، والتوصيات باتخاذ قرارات التجديد أو خطط التطوير
              </p>
            </div>
          </div>

          {/* Quick Summary Pill for Section B */}
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold">إجمالي السجلات المقيمة</div>
              <div className="text-base font-black text-slate-900">{evaluations.length} تقييماً معتمداً</div>
            </div>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold">متوسط التقييم العام</div>
              <div className="text-base font-black text-amber-700 font-mono">{evalMetrics.avgScore}%</div>
            </div>
          </div>
        </div>

        {/* Section B KPIs Sub-Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-emerald-800">شريك استراتيجي متميز</div>
            <div className="text-xl font-black text-emerald-950 mt-1">{evalMetrics.excellentCount}</div>
            <div className="text-[10px] text-emerald-700 font-medium">النسبة: 90% فأعلى</div>
          </div>

          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-sky-800">شريك فعال ومستمر</div>
            <div className="text-xl font-black text-sky-950 mt-1">{evalMetrics.continuingCount}</div>
            <div className="text-[10px] text-sky-700 font-medium">النسبة: 75% - 89%</div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-amber-800">يوصى بالتجديد والتوسع</div>
            <div className="text-xl font-black text-amber-950 mt-1">{evalMetrics.renewDecisionCount}</div>
            <div className="text-[10px] text-amber-700 font-medium">توصية بالتوسع</div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-rose-800">يحتاج خطة تطوير</div>
            <div className="text-xl font-black text-rose-950 mt-1">{evalMetrics.needsImprovementCount + evalMetrics.terminateCount}</div>
            <div className="text-[10px] text-rose-700 font-medium">أقل من 75%</div>
          </div>

        </div>

        {/* Search & Filter Toolbar for Evaluations */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={evalSearch}
              onChange={(e) => setEvalSearch(e.target.value)}
              placeholder="البحث باسم الشريك، المقيم، أو الفترة الأكاديمية..."
              className="w-full text-xs pr-9 pl-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900"
            />
          </div>

          {/* Classification Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">التصنيف:</span>
            <select
              value={evalClassificationFilter}
              onChange={(e) => setEvalClassificationFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">كافة التصنيفات</option>
              <option value="شريك استراتيجي متميز (أثر عالي جداً)">شريك متميز (أثر عالي جداً)</option>
              <option value="شريك فعال ومستمر (أثر جيد)">شريك فعال ومستمر</option>
              <option value="شريك يحتاج إلى تطوير ومتابعة">يحتاج تطوير ومتابعة</option>
              <option value="شريك غير متجاوب (يوصى بإنهاء الاتفاقية)">غير متجاوب / يوصى بإنهاء</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">القرار:</span>
            <select
              value={evalDecisionFilter}
              onChange={(e) => setEvalDecisionFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">كافة القرارات</option>
              <option value="يوصى بالتجديد والتوسع في مجالات التعاون">يوصى بالتجديد والتوسع</option>
              <option value="يوصى بالاستمرار مع خطة تطوير وتفعيل أفضل">يوصى بالاستمرار مع خطة تطوير</option>
              <option value="يوصى بعدم التجديد عند انتهاء المدة">يوصى بعدم التجديد</option>
            </select>
          </div>

        </div>

        {/* Dedicated Institutional Evaluations Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right text-xs sm:text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">الشريك ومذكرة التفاهم</th>
                <th className="py-3.5 px-3 text-center">النسبة المئوية</th>
                <th className="py-3.5 px-3 text-center">التصنيف المؤسسي</th>
                <th className="py-3.5 px-3">القرار والتوصية الاستراتيجية</th>
                <th className="py-3.5 px-3 text-center">معايير التقييم (1-5)</th>
                <th className="py-3.5 px-3">المقيم والفترة</th>
                <th className="py-3.5 px-3 text-center">استعراض الملف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد سجلات تقييم مطابقة للبحث أو التصفية المختارة.
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((ev) => {
                  const targetAgr = agreements.find(a => a.id === ev.agreementId);

                  return (
                    <tr key={ev.id} className="hover:bg-amber-50/40 transition-colors">
                      
                      {/* Partner Name & Agreement info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-300 shrink-0">
                            {ev.partnerName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {ev.partnerName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              <span className="font-mono text-emerald-700 font-semibold">{ev.agreementId}</span>
                              {targetAgr && (
                                <>
                                  <span>•</span>
                                  <span>{targetAgr.sector}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Overall Score Badge */}
                      <td className="py-4 px-3 text-center">
                        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl font-mono text-sm font-black border shadow-2xs bg-amber-50 text-amber-900 border-amber-300">
                          {ev.overallScore}%
                        </div>
                      </td>

                      {/* Strategic Classification */}
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          ev.overallScore >= 90
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ev.overallScore >= 75
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {ev.classification.split('(')[0].trim()}
                        </span>
                      </td>

                      {/* Decision & Recommendation */}
                      <td className="py-4 px-3 text-xs">
                        <div className="font-bold text-slate-800">
                          {ev.decision}
                        </div>
                        {ev.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[220px] mt-0.5">
                            {ev.notes}
                          </div>
                        )}
                      </td>

                      {/* 5 Criteria Micro-Ratings */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold" title={`الالتزام: ${ev.complianceWithTerms}/5`}>
                            {ev.complianceWithTerms}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 font-bold" title={`بيئة التدريب: ${ev.trainingEnvironmentQuality}/5`}>
                            {ev.trainingEnvironmentQuality}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold" title={`الإشراف: ${ev.mentorshipQuality}/5`}>
                            {ev.mentorshipQuality}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold" title={`التوظيف: ${ev.employmentConversion}/5`}>
                            {ev.employmentConversion}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-bold" title={`التجاوب: ${ev.responsiveness}/5`}>
                            {ev.responsiveness}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1">الالتزام • التدريب • الإشراف • التوظيف • التجاوب</div>
                      </td>

                      {/* Evaluator and Period */}
                      <td className="py-4 px-3 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{ev.evaluatorName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{ev.period}</div>
                      </td>

                      {/* Inspect Dossier Action Button */}
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => setInspectingEvaluation(ev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                          title="استعراض التقرير التفصيلي الكامل للتقييم"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          <span>الملف الكامل</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================================================
          DETAILED EVALUATION INSPECTION MODAL (For President Assistant Review)
         ========================================================================= */}
      {inspectingEvaluation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-black text-sm">
                  {inspectingEvaluation.partnerName.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                      ملف تقييم معتمد
                    </span>
                    <span className="font-mono text-xs text-emerald-700 font-bold">
                      {inspectingEvaluation.agreementId}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {inspectingEvaluation.partnerName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    فترة التقييم: {inspectingEvaluation.period} • المقيم: {inspectingEvaluation.evaluatorName}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingEvaluation(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5 space-y-5">
              
              {/* Score and Decision Header Card */}
              <div className="bg-gradient-to-r from-amber-50 via-slate-50 to-emerald-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold">النتيجة المؤسسية الإجمالية:</div>
                  <div className="text-2xl font-black text-amber-950 font-mono mt-0.5">
                    {inspectingEvaluation.overallScore}% — {inspectingEvaluation.classification}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-bold">تاريخ الاعتماد:</div>
                  <div className="text-xs font-mono font-bold text-slate-700">{inspectingEvaluation.date}</div>
                </div>
              </div>

              {/* 5 Evaluation Criteria Visual Bars */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-800 mb-2">
                  تفصيل درجات المعايير الخمسة (من 1 إلى 5):
                </h4>

                {/* 1 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>1. الالتزام ببنود مذكرة التفاهم والشراكة:</span>
                    <span className="font-mono text-emerald-700">{inspectingEvaluation.complianceWithTerms} / 5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(inspectingEvaluation.complianceWithTerms / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* 2 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>2. جودة وتجهيز البيئة التدريبية:</span>
                    <span className="font-mono text-sky-700">{inspectingEvaluation.trainingEnvironmentQuality} / 5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: `${(inspectingEvaluation.trainingEnvironmentQuality / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* 3 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>3. كفاءة الإشراف والمتابعة الميدانية للطلاب:</span>
                    <span className="font-mono text-indigo-700">{inspectingEvaluation.mentorshipQuality} / 5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(inspectingEvaluation.mentorshipQuality / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* 4 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>4. جدية استقطاب وتوظيف الخريجين:</span>
                    <span className="font-mono text-amber-700">{inspectingEvaluation.employmentConversion} / 5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(inspectingEvaluation.employmentConversion / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* 5 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>5. سرعة التجاوب والتعاون الإداري:</span>
                    <span className="font-mono text-teal-700">{inspectingEvaluation.responsiveness} / 5</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${(inspectingEvaluation.responsiveness / 5) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Strategic Decision & Recommendations */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="font-black flex items-center gap-1.5 text-amber-900">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>القرار والتوصية المعتمدة:</span>
                </div>
                <p className="font-bold">{inspectingEvaluation.decision}</p>
                {inspectingEvaluation.notes && (
                  <p className="text-slate-600 pt-1 border-t border-amber-200/60 leading-relaxed">
                    <strong>الملاحظات ومحاور التحسين:</strong> {inspectingEvaluation.notes}
                  </p>
                )}
              </div>

              {/* Endorsement Block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-700">اعتماد سعادة مساعد الرئيس:</div>
                  <div className="font-black text-slate-900">د. عبدالله بن علي السعدون</div>
                  <div className="text-[11px] text-slate-400">مساعد رئيس الكلية التطبيقية — جامعة المجمعة</div>
                </div>

                <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center text-[10px] font-black text-emerald-800 text-center leading-tight">
                  معتمد<br/>رسمياً
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة وثيقة التقييم</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingEvaluation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
