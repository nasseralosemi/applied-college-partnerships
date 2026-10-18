import React from 'react';
import { Building2, Filter, Check, ChevronDown, Sparkles } from 'lucide-react';
import { Agreement } from '../types';

interface AgreementSelectorProps {
  agreements: Agreement[];
  selectedAgreementId: string | null;
  onSelectAgreementId: (id: string | null) => void;
  title?: string;
  subtitle?: string;
}

export const AgreementSelector: React.FC<AgreementSelectorProps> = ({
  agreements,
  selectedAgreementId,
  onSelectAgreementId,
  title = 'تصفية حسب الاتفاقية والشريك',
  subtitle = 'اختر اتفاقية معينة لعرض وإدارة عملياتها الخاصة، أو اختر "كافة الشركاء" لاستعراض شامل'
}) => {
  return (
    <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs mb-5 sm:mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-base truncate">{title}</h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full md:w-auto shrink-0">
          <label htmlFor="select-bound-agreement" className="text-[11px] sm:text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 sm:hidden" />
            <span>الشريك المستهدف:</span>
          </label>
          <div className="relative w-full sm:w-[320px] md:w-[360px]">
            <select
              id="select-bound-agreement"
              value={selectedAgreementId || 'ALL'}
              onChange={(e) => onSelectAgreementId(e.target.value === 'ALL' ? null : e.target.value)}
              className="w-full appearance-none bg-white hover:bg-slate-50 focus:bg-white text-slate-800 font-bold text-xs sm:text-sm py-2.5 pr-3 pl-8 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-2xs truncate"
            >
              <option value="ALL">🌐 كافة الاتفاقيات والشركاء (عرض شامل)</option>
              {agreements.map((agr) => (
                <option key={agr.id} value={agr.id}>
                  {agr.partnerName} ({agr.id}) - {agr.status}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};
