import React from 'react';
import { 
  FileSignature, 
  Activity, 
  Smile, 
  Award,
  FileText
} from 'lucide-react';

export type TabId = 'agreements' | 'execution' | 'survey' | 'evaluation' | 'reports';

interface TabItem {
  id: TabId;
  label: string;
  englishLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabsNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  agreementsCount: number;
  executionsCount: number;
  surveysCount: number;
  evaluationsCount: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  activeTab,
  onTabChange,
  agreementsCount,
  executionsCount,
  surveysCount,
  evaluationsCount
}) => {
  const tabs: TabItem[] = [
    {
      id: 'agreements',
      label: 'الاتفاقيات والشراكات',
      englishLabel: 'Agreements',
      icon: FileSignature,
      count: agreementsCount
    },
    {
      id: 'execution',
      label: 'التنفيذ والأنشطة',
      englishLabel: 'Execution',
      icon: Activity,
      count: executionsCount
    },
    {
      id: 'survey',
      label: 'استبيان رضا الشريك',
      englishLabel: 'Partner Survey',
      icon: Smile,
      count: surveysCount
    },
    {
      id: 'evaluation',
      label: 'تقييم الشريك المؤسسي',
      englishLabel: 'Partner Evaluation',
      icon: Award,
      count: evaluationsCount
    },
    {
      id: 'reports',
      label: 'التقارير الشاملة',
      englishLabel: 'Annual Reports',
      icon: FileText
    }
  ];

  return (
    <nav aria-label="شريط التبويبات الرئيسي" className="no-print bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs sticky top-[57px] sm:top-[69px] z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-reverse space-x-1.5 sm:space-x-3 overflow-x-auto py-2 sm:py-2.5 no-scrollbar touch-pan-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer border shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-md shadow-emerald-900/10 transform scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`hidden md:inline text-[10px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                  ({tab.englishLabel})
                </span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`mr-0.5 sm:mr-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                      isActive
                        ? 'bg-emerald-900/80 text-amber-300 border border-emerald-600/60'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
