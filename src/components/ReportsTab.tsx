import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  GraduationCap, 
  CheckCircle2, 
  FileText, 
  Award, 
  Briefcase, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Users, 
  Smile, 
  Clock, 
  CheckCheck, 
  Filter, 
  ShieldCheck, 
  Target,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Agreement, ExecutionActivity, PartnerSurvey, PartnerEvaluation, StatsData, SectorType } from '../types';

interface ReportsTabProps {
  agreements: Agreement[];
  executions: ExecutionActivity[];
  surveys: PartnerSurvey[];
  evaluations: PartnerEvaluation[];
  stats: StatsData;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  agreements,
  executions,
  surveys,
  evaluations,
  stats
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [reportPeriod, setReportPeriod] = useState<string>('1446-1447هـ (العام الأكاديمي الحالي)');

  // Filtered agreements if sector filter selected
  const filteredAgreements = sectorFilter === 'ALL' 
    ? agreements 
    : agreements.filter(a => a.sector === sectorFilter);

  // Computed metrics
  const totalTargetTraining = agreements.reduce((sum, a) => sum + (a.targetTrainingCount || 0), 0);
  const totalTargetEmployment = agreements.reduce((sum, a) => sum + (a.targetEmploymentCount || 0), 0);
  
  const actualTraining = stats.totalTrainingBeneficiaries;
  const actualEmployment = stats.totalEmploymentBeneficiaries;

  const trainingAchievementRate = totalTargetTraining > 0 
    ? Math.min(100, Math.round((actualTraining / totalTargetTraining) * 100)) 
    : 0;

  const employmentAchievementRate = totalTargetEmployment > 0 
    ? Math.min(100, Math.round((actualEmployment / totalTargetEmployment) * 100)) 
    : 0;

  // Average Survey Satisfaction
  const avgSatisfaction = surveys.length > 0 
    ? (surveys.reduce((sum, s) => sum + s.satisfactionLevel, 0) / surveys.length).toFixed(1)
    : '5.0';

  const willingToRenewCount = surveys.filter(s => s.willingToRenew).length;
  const renewalWillingnessRate = surveys.length > 0 
    ? Math.round((willingToRenewCount / surveys.length) * 100) 
    : 100;

  // Average Evaluation Score
  const avgEvaluationScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, ev) => sum + ev.overallScore, 0) / evaluations.length)
    : 92;

  // Sector breakdown count
  const sectorCounts: Record<SectorType, number> = {
    'حكومي': agreements.filter(a => a.sector === 'حكومي').length,
    'خاص': agreements.filter(a => a.sector === 'خاص').length,
    'شبه حكومي': agreements.filter(a => a.sector === 'شبه حكومي').length,
    'غير ربحي': agreements.filter(a => a.sector === 'غير ربحي').length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Standard print dialog enables Save as PDF with full vector formatting
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action & Period Control Bar (Hidden on print) */}
      <div className="no-print bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  التقرير السنوي الشامل لمؤشرات الشراكات والاتفاقيات
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  استعراض تنفيذي متكامل يوثق مخرجات التدريب، التوظيف، استبيانات الرضا، وتقييم الأداء المؤسسي
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Filter by Sector */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">القطاع:</span>
              <select
                id="report-filter-sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">كافة القطاعات ({agreements.length})</option>
                <option value="حكومي">حكومي ({sectorCounts['حكومي']})</option>
                <option value="خاص">خاص ({sectorCounts['خاص']})</option>
                <option value="شبه حكومي">شبه حكومي ({sectorCounts['شبه حكومي']})</option>
                <option value="غير ربحي">غير ربحي ({sectorCounts['غير ربحي']})</option>
              </select>
            </div>

            {/* Download PDF Button */}
            <button
              id="btn-download-pdf-report"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
              title="تحميل وحفظ التقرير كملف PDF رسمي"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>تحميل التقرير PDF</span>
            </button>

            {/* Print Report Button */}
            <button
              id="btn-print-full-report"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
              title="طباعة التقرير الرسمي عبر الطابعة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>

          </div>

        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div 
        id="comprehensive-report-document" 
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        
        {/* 1. Official Institutional Letterhead */}
        <div className="border-b-2 border-emerald-800 pb-6">
          <div className="flex justify-between items-start text-center">
            
            {/* Right: Country and University Hierarchy */}
            <div className="text-right space-y-1">
              <p className="text-xs font-bold text-slate-600">المملكة العربية السعودية</p>
              <p className="text-sm sm:text-base font-black text-slate-900">وزارة التعليم — جامعة المجمعة</p>
              <p className="text-sm sm:text-base font-black text-emerald-800">الكلية التطبيقية</p>
              <p className="text-xs font-bold text-slate-500">وحدة الشراكات والتدريب والتطوير المهني</p>
            </div>

            {/* Center: University Emblem Badge */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-amber-300 border-2 border-amber-400 flex items-center justify-center shadow-md">
                <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <span className="text-[10px] font-black text-slate-400 mt-1 font-mono tracking-widest">
                MAJMAAH UNIVERSITY
              </span>
            </div>

            {/* Left: Metadata & Document Reference */}
            <div className="text-left space-y-1 text-xs">
              <p><span className="font-bold text-slate-500">التاريخ:</span> <span className="font-medium text-slate-800">{currentDate}</span></p>
              <p><span className="font-bold text-slate-500">الفترة المشمولة:</span> <span className="font-medium text-slate-800">1446-1447هـ</span></p>
              <p><span className="font-bold text-slate-500">الرقم المرجعي:</span> <span className="font-mono font-bold text-emerald-800">REP-MU-APP-2025</span></p>
              <p><span className="font-bold text-slate-500">صفة التقرير:</span> <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">معتمد رسمياً</span></p>
            </div>

          </div>

          <div className="mt-6 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              التقرير المؤسسي الشامل لأداء الشراكات والاتفاقيات
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium max-w-2xl mx-auto">
              توثيق تفصيلي لفاعلية مذكرات التفاهم ومخرجات التدريب والتوظيف ونتائج قياس رضا الشركاء والتقييم السنوي
            </p>
          </div>
        </div>

        {/* 2. Executive Indicators & Achievement Ratios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-r-4 border-emerald-700 pr-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>أولاً: ملخص المؤشرات الاستراتيجية ونسب تحقيق المستهدفات</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">KPIs Overview</span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Total Agreements */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">إجمالي الاتفاقيات</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{stats.totalAgreements}</span>
              <span className="text-[10px] text-slate-500 block mt-1 font-bold">شراكة معتمدة</span>
            </div>

            {/* Active Agreements */}
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-800 block mb-1">الاتفاقيات السارية</span>
              <span className="text-2xl font-black text-emerald-900 font-mono">{stats.activeAgreements}</span>
              <span className="text-[10px] text-emerald-700 block mt-1 font-bold">
                {Math.round((stats.activeAgreements / (stats.totalAgreements || 1)) * 100)}% من الإجمالي
              </span>
            </div>

            {/* Training Target vs Actual */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-900 block mb-1">مستفيدي التدريب</span>
              <span className="text-2xl font-black text-amber-950 font-mono">{actualTraining}</span>
              <span className="text-[10px] text-amber-800 block mt-1 font-bold">
                المستهدف: {totalTargetTraining} ({trainingAchievementRate}%)
              </span>
            </div>

            {/* Employment Target vs Actual */}
            <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 text-center">
              <span className="text-[11px] font-bold text-purple-900 block mb-1">مستفيدي التوظيف</span>
              <span className="text-2xl font-black text-purple-950 font-mono">{actualEmployment}</span>
              <span className="text-[10px] text-purple-800 block mt-1 font-bold">
                المستهدف: {totalTargetEmployment} ({employmentAchievementRate}%)
              </span>
            </div>

            {/* Partner Satisfaction */}
            <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 text-center">
              <span className="text-[11px] font-bold text-sky-900 block mb-1">معدل الرضا العام</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black text-sky-950 font-mono">{avgSatisfaction}</span>
                <span className="text-xs font-bold text-sky-700">/ 5</span>
              </div>
              <span className="text-[10px] text-sky-800 block mt-1 font-bold">
                رغبة التجديد: {renewalWillingnessRate}%
              </span>
            </div>

            {/* Evaluation Score */}
            <div className="p-3.5 bg-teal-50/80 rounded-2xl border border-teal-200 text-center">
              <span className="text-[11px] font-bold text-teal-900 block mb-1">متوسط تقييم الأداء</span>
              <span className="text-2xl font-black text-teal-950 font-mono">{avgEvaluationScore}%</span>
              <span className="text-[10px] text-teal-800 block mt-1 font-bold">تصنيف عام (أ) متميز</span>
            </div>

          </div>

          {/* Sector Breakdown Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>توزيع الشراكات حسب القطاع:</span>
            </div>
            <div className="flex items-center flex-wrap gap-4 font-bold">
              <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-200">
                الحكومي: {sectorCounts['حكومي']} ({Math.round((sectorCounts['حكومي'] / (agreements.length || 1)) * 100)}%)
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-200">
                الخاص: {sectorCounts['خاص']} ({Math.round((sectorCounts['خاص'] / (agreements.length || 1)) * 100)}%)
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                شبه الحكومي: {sectorCounts['شبه حكومي']} ({Math.round((sectorCounts['شبه حكومي'] / (agreements.length || 1)) * 100)}%)
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                غير الربحي: {sectorCounts['غير ربحي']} ({Math.round((sectorCounts['غير ربحي'] / (agreements.length || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </section>

        {/* 3. Detailed Partnerships & Agreements Register */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-r-4 border-emerald-700 pr-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>ثانياً: سجل الشراكات والاتفاقيات المعتمدة ومستهدفاتها</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              ({filteredAgreements.length} اتفاقية)
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">رقم الاتفاقية</th>
                  <th className="p-3">اسم الجهة الشريكة</th>
                  <th className="p-3">القطاع والنوع</th>
                  <th className="p-3">المدينة / المقر</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">تاريخ الانتهاء</th>
                  <th className="p-3">مستهدف التدريب</th>
                  <th className="p-3">مستهدف التوظيف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgreements.map((agr, idx) => (
                  <tr key={agr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{agr.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{agr.partnerName}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{agr.domains?.join(' • ')}</p>
                    </td>
                    <td className="p-3 text-slate-700">
                      <span className="font-medium">{agr.sector}</span>
                      <span className="text-slate-400 block text-[10px]">{agr.agreementType}</span>
                    </td>
                    <td className="p-3 text-slate-600">{agr.city}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        agr.status === 'سارية' ? 'bg-emerald-100 text-emerald-800' :
                        agr.status === 'جديدة' ? 'bg-sky-100 text-sky-800' :
                        agr.status === 'منتهية' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {agr.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{agr.expiryDate}</td>
                    <td className="p-3 font-mono font-bold text-amber-800">{agr.targetTrainingCount} طالب</td>
                    <td className="p-3 font-mono font-bold text-purple-800">{agr.targetEmploymentCount} خريج</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Execution Activities & Field Outputs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-r-4 border-emerald-700 pr-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>ثالثاً: مخرجات التنفيذ الميداني والأنشطة والتوظيف</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Execution Operations</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">رقم العملية</th>
                  <th className="p-3">النشاط / البرنامج</th>
                  <th className="p-3">الشريك المستضيف</th>
                  <th className="p-3">النوع والمقر</th>
                  <th className="p-3">تاريخ التنفيذ</th>
                  <th className="p-3">المتدربين</th>
                  <th className="p-3">الموظفين</th>
                  <th className="p-3">نسبة الإنجاز</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executions.slice(0, 8).map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{ex.id}</td>
                    <td className="p-3 font-bold text-slate-900">{ex.title}</td>
                    <td className="p-3 text-slate-700">{ex.partnerName}</td>
                    <td className="p-3 text-slate-600">
                      <span>{ex.type}</span>
                      <span className="text-[10px] text-slate-400 block">{ex.location}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{ex.date}</td>
                    <td className="p-3 font-mono font-bold text-amber-800">{ex.traineesCount}</td>
                    <td className="p-3 font-mono font-bold text-purple-800">{ex.employedCount}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full" 
                            style={{ width: `${ex.achievementRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{ex.achievementRate}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ex.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                        ex.status === 'جاري التنفيذ' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Partner Evaluation & Strategic Renewal Decisions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-r-4 border-emerald-700 pr-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>رابعاً: نتائج التقييم المؤسسي السنوي وتوصيات التجديد</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Institutional Evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {evaluations.map((ev) => (
              <div key={ev.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{ev.partnerName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{ev.period} — المقيم: {ev.evaluatorName}</p>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {ev.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">التصنيف المؤسسي:</span>
                    <span className="font-bold text-slate-800 text-[11px]">{ev.classification}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">القرار الموصى به:</span>
                    <span className="font-bold text-emerald-800 text-[11px]">{ev.decision}</span>
                  </div>
                </div>

                {ev.notes && (
                  <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-200/70">
                    <span className="font-bold text-slate-700">ملاحظات التقييم:</span> {ev.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. Official Signatures and Endorsements Block */}
        <section className="pt-8 border-t-2 border-slate-300">
          <div className="flex flex-col items-center justify-center text-center text-xs max-w-md mx-auto">
            
            <div className="space-y-1.5 w-full bg-slate-50/80 rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] mb-1">
                الاعتماد الرسمي المعتمد للتقرير
              </span>
              <p className="font-bold text-slate-500">المسؤول عن وحدة الشراكات والاتفاقيات</p>
              <p className="font-black text-slate-900 text-base sm:text-lg">د. عبدالله بن علي السعدون</p>
              <p className="text-xs sm:text-sm text-emerald-800 font-bold">مساعد رئيس الكلية التطبيقية</p>
              <div className="mt-8 border-b-2 border-dotted border-slate-400 w-48 mx-auto"></div>
              <p className="text-[11px] text-slate-400 pt-1 font-medium">التوقيع والختم الرسمي المعتمد</p>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
};
