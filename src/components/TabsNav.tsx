import React, { useState } from 'react';
import { 
  FileSignature, 
  Activity, 
  Smile, 
  Award,
  FileText,
  Crown,
  Users,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { AuthUser } from '../types';

export type TabId = 
  | 'president-dashboard'
  | 'agreements' 
  | 'execution' 
  | 'survey' 
  | 'evaluation' 
  | 'reports'
  | 'users';

interface TabItem {
  id: TabId;
  label: string;
  englishLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  highlight?: boolean;
}

interface TabsNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  currentUser?: AuthUser | null;
  agreementsCount: number;
  executionsCount: number;
  surveysCount: number;
  evaluationsCount: number;
  usersCount?: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  agreementsCount,
  executionsCount,
  surveysCount,
  evaluationsCount,
  usersCount = 6
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleType = currentUser?.roleType || 'coordinator';

  // Role-Based Tabs Definition
  // 1. President Assistant: Exclusively dedicated to Executive Dashboard (Interactive Charts & Evaluations Review)
  // 2. Employees / Coordinators: Evaluation tab and President tab are strictly hidden!
  // 3. System Admin: Dedicated Users Management tab, plus agreements, execution, survey, evaluation, reports
  const allTabs: TabItem[] = [
    {
      id: 'president-dashboard',
      label: 'لوحة مساعد الرئيس',
      englishLabel: "President's Desk",
      icon: Crown,
      highlight: true
    },
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
    },
    {
      id: 'users',
      label: 'إدارة الحسابات',
      englishLabel: 'Create Accounts',
      icon: Users
    }
  ];

  // Filter tabs strictly based on Role-Based Access Control (RBAC)
  const allowedTabs = allTabs.filter(tab => {
    // 1. President Assistant view: Exclusively Executive Dashboard
    if (roleType === 'president_assistant') {
      return tab.id === 'president-dashboard';
    }

    // 2. Admin view: Exclusively Users & Accounts Management
    if (roleType === 'admin') {
      return tab.id === 'users';
    }

    // 3. Employees & Coordinators (partnerships_head, coordinator, reviewer, general):
    // Strictly HIDE:
    // - 'evaluation' ("تقييم الشريك المؤسسي")
    // - 'president-dashboard' ("لوحة مساعد الرئيس")
    // - 'users' (Admin Users management)
    if (tab.id === 'evaluation') return false;
    if (tab.id === 'president-dashboard') return false;
    if (tab.id === 'users') return false;

    return true;
  });

  const currentActiveItem = allowedTabs.find(t => t.id === activeTab) || allowedTabs[0];
  const CurrentActiveIcon = currentActiveItem ? currentActiveItem.icon : FileSignature;

  const handleMobileSelect = (id: TabId) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  // If user is President Assistant, show a dedicated executive indicator bar
  if (roleType === 'president_assistant') {
    return (
      <nav aria-label="شريط مساعد الرئيس التنفيذي" className="no-print bg-slate-900 text-white border-b border-amber-500/30 shadow-md sticky top-[57px] sm:top-[69px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-amber-200">
                الواجهة التنفيذية المستقلة لمساعد رئيس الكلية التطبيقية
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                (أ) التحليلات والرسومات البيانية التفاعلية • (ب) مراجعة تقييم الشريك المؤسسي
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>جلسة قيادية نشطة</span>
            </span>
          </div>
        </div>
      </nav>
    );
  }

  // If user is Admin, show a dedicated System Admin Panel bar (exclusive to accounts management)
  if (roleType === 'admin') {
    return (
      <nav aria-label="شريط مدير النظام" className="no-print bg-slate-900 text-white border-b border-purple-500/30 shadow-md sticky top-[57px] sm:top-[69px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-purple-200">
                لوحة تحكم مدير النظام (System Admin Panel)
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                إدارة وتعديل وإنشاء الحسابات والصلاحيات فقط
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>واجهة إدارة المستخدمين المستقلة</span>
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="شريط التبويبات الرئيسي" className="no-print bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs sticky top-[57px] sm:top-[69px] z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            1. MOBILE NAVIGATION (Visible only on block md:hidden)
            Modern Segmented / Custom Select Dropdown without any horizontal scrolling
           ========================================================================= */}
        <div className="block md:hidden py-2.5">
          <div className="relative">
            {/* Active Tab Button / Dropdown Toggle */}
            <button
              type="button"
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-300 shadow-sm text-slate-800 font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentActiveItem.id === 'president-dashboard'
                    ? 'bg-amber-100 text-amber-700'
                    : currentActiveItem.id === 'users'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <CurrentActiveIcon className="w-4 h-4" />
                </div>
                <div className="text-right min-w-0">
                  <div className="text-xs text-slate-400 font-medium leading-none mb-1">
                    الصفحة الحالية:
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {currentActiveItem.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentActiveItem.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {currentActiveItem.count}
                  </span>
                )}
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  {mobileMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Mobile Dropdown Menu Options */}
            {mobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                  <span>اختر الصفحة المطلوبة:</span>
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                </div>
                {allowedTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleMobileSelect(tab.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                        isActive
                          ? tab.id === 'users'
                            ? 'bg-purple-50 text-purple-950 font-black border border-purple-200'
                            : 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700 font-medium border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive 
                            ? tab.id === 'users' ? 'bg-purple-600 text-white' : 'bg-emerald-700 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs truncate">{tab.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{tab.englishLabel}</div>
                        </div>
                      </div>

                      {tab.count !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive 
                            ? 'bg-white text-emerald-900 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            2. DESKTOP TABS BAR (Visible only on hidden md:block)
            Horizontal tabs with full badges and role constraints
           ========================================================================= */}
        <div className="hidden md:flex items-center justify-between overflow-x-auto no-scrollbar gap-1 py-1">
          <div className="flex items-center gap-1 min-w-max">
            {allowedTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`tab-btn-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative flex items-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? tab.id === 'president-dashboard'
                        ? 'bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-xs'
                        : tab.id === 'users'
                          ? 'bg-purple-100/90 text-purple-950 border border-purple-300/80 shadow-xs'
                          : 'bg-white text-emerald-950 border border-slate-200/90 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? tab.id === 'president-dashboard'
                        ? 'bg-amber-600 text-white'
                        : tab.id === 'users'
                          ? 'bg-purple-600 text-white'
                          : 'bg-emerald-700 text-white'
                      : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-300'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <span className="truncate">{tab.label}</span>

                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-colors ${
                      isActive
                        ? tab.id === 'users'
                          ? 'bg-purple-200/70 text-purple-900'
                          : 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}

                  {/* Active Bottom Indicator Line */}
                  {isActive && (
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${
                      tab.id === 'president-dashboard'
                        ? 'bg-amber-600'
                        : tab.id === 'users'
                          ? 'bg-purple-600'
                          : 'bg-emerald-700'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Role Status Tag on the left side of desktop bar */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200/60 text-slate-600 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>الصلاحية: {currentUser?.role || 'مستخدم النظام'}</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
