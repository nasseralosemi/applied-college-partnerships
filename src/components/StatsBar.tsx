import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';
import { StatsData } from '../types';

interface StatsBarProps {
  stats: StatsData;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats
}) => {
  return (
    <section 
      aria-label="الشريط الإحصائي المباشر" 
      className="no-print bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          
          {/* 1. Total Agreements */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-emerald-300 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-600 truncate">إجمالي الاتفاقيات</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{stats.totalAgreements}</span>
                <span className="text-[10px] text-slate-500 font-medium">مذكرة / عقد</span>
              </div>
            </div>
          </div>

          {/* 2. Active Agreements */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-emerald-300 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-800 truncate">الاتفاقيات السارية</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-900">{stats.activeAgreements}</span>
                <span className="text-[10px] text-emerald-700 font-medium">مفعّلة</span>
              </div>
            </div>
          </div>

          {/* 3. New Agreements */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-emerald-300 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-teal-100/90 text-teal-800 border border-teal-300/60 shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-teal-800 truncate">اتفاقيات جديدة</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-teal-900">{stats.newAgreements}</span>
                <span className="text-[10px] text-teal-700 font-medium">هذا العام</span>
              </div>
            </div>
          </div>

          {/* 4. Expired Agreements */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-rose-200 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-rose-100/90 text-rose-800 border border-rose-300/60 shrink-0">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-rose-800 truncate">المنتهية / للتجديد</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-rose-900">{stats.expiredAgreements}</span>
                <span className="text-[10px] text-rose-700 font-medium">تحتاج متابعة</span>
              </div>
            </div>
          </div>

          {/* 5. Total Training Beneficiaries */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-amber-200 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-amber-100/90 text-amber-800 border border-amber-300/60 shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-amber-800 truncate">مستفيدي التدريب</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{stats.totalTrainingBeneficiaries}</span>
                <span className="text-[10px] text-slate-500 font-medium">طالب وطالبة</span>
              </div>
            </div>
          </div>

          {/* 6. Total Employment Beneficiaries */}
          <div className="bg-emerald-50/50 hover:bg-emerald-50/90 backdrop-blur-xs transition-all rounded-2xl p-3 border border-emerald-200/70 hover:border-emerald-300 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shrink-0">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-800 truncate">مستفيدي التوظيف</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{stats.totalEmploymentBeneficiaries}</span>
                <span className="text-[10px] text-slate-500 font-medium">خريج موظف</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
