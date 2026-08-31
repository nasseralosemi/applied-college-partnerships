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
    <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="select-bound-agreement" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            الشريك المستهدف:
          </label>
          <div className="relative min-w-[240px] sm:min-w-[300px]">
            <select
              id="select-bound-agreement"
              value={selectedAgreementId || 'ALL'}
              onChange={(e) => onSelectAgreementId(e.target.value === 'ALL' ? null : e.target.value)}
              className="w-full appearance-none bg-white hover:bg-slate-50 focus:bg-white text-slate-800 font-bold text-xs sm:text-sm py-2.5 px-3 pl-8 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-2xs"
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
