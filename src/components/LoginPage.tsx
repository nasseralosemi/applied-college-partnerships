import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Crown,
  Users,
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  KeyRound,
  Cloud
} from 'lucide-react';
import { AuthUser, SystemUser } from '../types';
import { INITIAL_USERS } from '../data/initialUsers';

export type PortalTabId = 'staff' | 'president' | 'admin';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  availableUsers?: SystemUser[];
}

interface PortalConfig {
  id: PortalTabId;
  tabLabel: string;
  tabEnglish: string;
  cardTitle: string;
  cardSubtitle: string;
  portalBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  buttonGradient: string;
  activeTabClass: string;
  iconBgClass: string;
  defaultUsername: string;
}

// ---------------------------------------------------------------------------
// Exact requested Portal Role Tab Labels:
// 1. "الموظفون"
// 2. "المسؤول"
// 3. "مدير النظام"
// ---------------------------------------------------------------------------
const PORTAL_CONFIGS: Record<PortalTabId, PortalConfig> = {
  staff: {
    id: 'staff',
    tabLabel: 'الموظفون',
    tabEnglish: 'Staff',
    cardTitle: 'بوابة الموظفين ومسؤولي الشراكات',
    cardSubtitle: 'مدخلات الاتفاقيات وعمليات التدريب والتوظيف واستبيانات الشركاء',
    portalBadge: 'بوابة الموظفين والعمليات التشغيلية',
    icon: Users,
    accentColor: 'from-emerald-600 via-teal-500 to-emerald-400',
    buttonGradient: 'from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700',
    activeTabClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border-emerald-400',
    iconBgClass: 'from-emerald-700 to-teal-900 border-emerald-400/40 text-emerald-200',
    defaultUsername: 'shayea.s'
  },
  president: {
    id: 'president',
    tabLabel: 'المسؤول',
    tabEnglish: 'Executive',
    cardTitle: 'بوابة المسؤول (المكتب التنفيذي)',
    cardSubtitle: 'لوحة التحليلات والمؤشرات البيانية ومراجعة تقييم الشريك المؤسسي',
    portalBadge: 'الواجهة التنفيذية لسعادة مساعد الرئيس',
    icon: Crown,
    accentColor: 'from-amber-500 via-yellow-400 to-amber-600',
    buttonGradient: 'from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-500 hover:to-amber-600 text-white',
    activeTabClass: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/40 border-amber-300 font-black',
    iconBgClass: 'from-amber-600 to-amber-900 border-amber-300/40 text-amber-200',
    defaultUsername: 'dr.saadoun'
  },
  admin: {
    id: 'admin',
    tabLabel: 'مدير النظام',
    tabEnglish: 'System Admin',
    cardTitle: 'لوحة تحكم مدير النظام',
    cardSubtitle: 'إدارة وتعديل وإنشاء حسابات المستخدمين وتعيين الصلاحيات فقط',
    portalBadge: 'بوابة الإدارة التقنية للحسابات والصلاحيات',
    icon: ShieldCheck,
    accentColor: 'from-purple-600 via-indigo-500 to-purple-400',
    buttonGradient: 'from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600',
    activeTabClass: 'bg-purple-600 text-white shadow-lg shadow-purple-950/40 border-purple-400',
    iconBgClass: 'from-purple-700 to-indigo-900 border-purple-400/40 text-purple-200',
    defaultUsername: 'admin'
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  availableUsers = INITIAL_USERS 
}) => {
  // Active Portal Tab
  const [activePortal, setActivePortal] = useState<PortalTabId>('president');
  
  // Credentials
  const [username, setUsername] = useState('dr.saadoun');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConfig = PORTAL_CONFIGS[activePortal];
  const PortalIcon = currentConfig.icon;

  // Filter available users to match the selected portal
  const portalUsers = availableUsers.filter(u => {
    if (activePortal === 'president') {
      return u.roleType === 'president_assistant';
    }
    if (activePortal === 'admin') {
      return u.roleType === 'admin';
    }
    // Staff portal includes all non-president and non-admin users
    return u.roleType !== 'president_assistant' && u.roleType !== 'admin';
  });

  // Switch tab and automatically populate with primary demo account for that portal
  const handleTabChange = (portalId: PortalTabId) => {
    setActivePortal(portalId);
    setError(null);
    const config = PORTAL_CONFIGS[portalId];
    
    // Find matching demo user or default
    const matchingUsers = availableUsers.filter(u => {
      if (portalId === 'president') return u.roleType === 'president_assistant';
      if (portalId === 'admin') return u.roleType === 'admin';
      return u.roleType !== 'president_assistant' && u.roleType !== 'admin';
    });

    const targetUser = matchingUsers.find(u => u.username === config.defaultUsername) || matchingUsers[0];
    if (targetUser) {
      setUsername(targetUser.username);
    } else {
      setUsername(config.defaultUsername);
    }
    setPassword('123456');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الأكاديمي');
      return;
    }

    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = username.trim().toLowerCase();
      const matchedUser = availableUsers.find(
        u => u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
      );

      if (matchedUser && matchedUser.status === 'معطل') {
        setIsLoading(false);
        setError('عذراً، هذا الحساب معطل حالياً. يرجى التواصل مع إدارة النظام.');
        return;
      }

      // If matched, use user object; otherwise construct role based on portal
      let authenticatedUser: AuthUser;

      if (matchedUser) {
        authenticatedUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role,
          roleType: matchedUser.roleType,
          department: matchedUser.department,
          initials: matchedUser.initials,
          status: matchedUser.status
        };
      } else {
        // Fallback for custom username typed within this portal
        if (activePortal === 'president') {
          authenticatedUser = {
            id: `USR-${Math.floor(100 + Math.random() * 900)}`,
            username: username.trim(),
            name: 'د. عبدالله بن علي السعدون',
            role: 'مساعد رئيس الكلية التطبيقية',
            roleType: 'president_assistant',
            department: 'مكتب مساعد رئيس الكلية التطبيقية — جامعة المجمعة',
            initials: 'ع.س',
            status: 'نشط'
          };
        } else if (activePortal === 'admin') {
          authenticatedUser = {
            id: `USR-${Math.floor(100 + Math.random() * 900)}`,
            username: username.trim(),
            name: 'مدير نظام المنصة',
            role: 'مدير النظام ومسؤول المنصة التقني',
            roleType: 'admin',
            department: 'وحدة الشراكات وتقنية المعلومات — الكلية التطبيقية',
            initials: 'م.ن',
            status: 'نشط'
          };
        } else {
          authenticatedUser = {
            id: `USR-${Math.floor(100 + Math.random() * 900)}`,
            username: username.trim(),
            name: username.trim(),
            role: 'مسؤول إدارة الاتفاقيات والتدريب',
            roleType: 'partnerships_head',
            department: 'الكلية التطبيقية — جامعة المجمعة',
            initials: username.trim().slice(0, 2).toUpperCase(),
            status: 'نشط'
          };
        }
      }

      setIsLoading(false);
      onLogin(authenticatedUser);
    }, 400);
  };

  const handleSelectQuickUser = (user: SystemUser) => {
    setUsername(user.username);
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col justify-between p-3 sm:p-5 md:p-8 selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* =========================================================================
          Top University Brand Header (Fully Responsive with Smooth Wrapping)
         ========================================================================= */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3 py-2 sm:py-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs sm:text-sm font-bold tracking-tight truncate">
              جامعة المجمعة | Majmaah University
            </div>
            <div className="text-emerald-300 text-[10px] sm:text-xs font-medium truncate mt-0.5">
              الكلية التطبيقية — نظام إدارة الشراكات والاتفاقيات
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Direct Automatic Cloud Storage Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-bold backdrop-blur-xs"
            title="التخزين السحابي نشط وتلقائي — حفظ البيانات متزامن ومباشر"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="hidden sm:inline">سحابي مباشر</span>
            <span className="sm:hidden">سحابي</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-200/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>بوابة موحدة معتمدة</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Main Login Workspace Container (Optimized for all viewports)
         ========================================================================= */}
      <div className="my-auto max-w-lg w-full mx-auto py-3 sm:py-6 px-1 sm:px-0">
        
        {/* =========================================================================
            1. PORTAL ROLE TABS (Top Tab Bar Above Login Card)
            3 Explicitly Named Doors: "الموظفون" | "المسؤول" | "مدير النظام"
           ========================================================================= */}
        <div className="mb-3 sm:mb-4">
          <div className="text-center mb-2">
            <span className="text-[11px] font-bold text-emerald-300/95 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>اختر بوابة الدخول بحسب الصلاحية:</span>
            </span>
          </div>

          <nav aria-label="أبواب الدخول بحسب الدور" className="grid grid-cols-3 gap-1 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-2xl">
            {(Object.keys(PORTAL_CONFIGS) as PortalTabId[]).map((portalKey) => {
              const cfg = PORTAL_CONFIGS[portalKey];
              const Icon = cfg.icon;
              const isActive = activePortal === portalKey;

              return (
                <button
                  key={portalKey}
                  type="button"
                  id={`portal-tab-${portalKey}`}
                  onClick={() => handleTabChange(portalKey)}
                  className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? `${cfg.activeTabClass} border`
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-black whitespace-nowrap">
                      {cfg.tabLabel}
                    </span>
                  </div>
                  <span className={`text-[9px] sm:text-[10px] hidden xs:inline tracking-tight truncate max-w-full ${
                    isActive 
                      ? (portalKey === 'president' ? 'text-slate-800 font-bold' : 'text-white/80') 
                      : 'text-slate-400'
                  }`}>
                    {cfg.tabEnglish}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* =========================================================================
            2. LOGIN CARD CONTAINER (Dynamically updates with selected portal)
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden transition-all duration-300">
          
          {/* Top Dynamic Decorative Accent Strip */}
          <div className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-r ${currentConfig.accentColor} transition-all duration-300`}></div>

          {/* Card Header — Role Specific Identity */}
          <div className="text-center mb-5 sm:mb-6 pt-1 sm:pt-2">
            <div className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${currentConfig.iconBgClass} border-2 flex items-center justify-center mx-auto shadow-lg mb-3 transition-all duration-300`}>
              <PortalIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[260px]">{currentConfig.portalBadge}</span>
            </div>

            <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {currentConfig.cardTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-md mx-auto">
              {currentConfig.cardSubtitle}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو البريد الأكاديمي
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="login-username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: dr.saadoun أو admin أو shayea.s"
                  className="w-full pr-10 pl-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all text-right font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور (Password)
                </label>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                  الافتراضية: <strong className="text-slate-700 font-mono">123456</strong>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-11 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Login Button */}
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className={`w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r ${currentConfig.buttonGradient} text-white font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-1 sm:mt-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ التحقق وتوجيهك لبوابة {currentConfig.tabLabel}...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول إلى {currentConfig.tabLabel}</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* =========================================================================
              3. DEMO ACCOUNTS FOR THIS PORTAL
              Filtered strictly by active role portal
             ========================================================================= */}
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                <KeyRound className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>الحسابات التجريبية المعتمدة:</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                نقرة للتعبئة
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2 max-h-[190px] sm:max-h-[220px] overflow-y-auto pr-0.5">
              {portalUsers.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  لا توجد حسابات مسجلة تحت هذا الدور، يمكنك كتابة اسم المستخدم للدخول
                </div>
              ) : (
                portalUsers.map((usr) => {
                  const isSelected = username === usr.username;

                  return (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(usr)}
                      className={`w-full text-right p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between cursor-pointer gap-2 ${
                        isSelected
                          ? activePortal === 'president'
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-xs'
                            : activePortal === 'admin'
                              ? 'bg-purple-50/90 border-purple-300 text-purple-950 font-bold shadow-xs'
                              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-white font-mono text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-br ${
                          usr.avatarColor || (
                            activePortal === 'president'
                              ? 'from-amber-600 to-amber-800'
                              : activePortal === 'admin'
                                ? 'from-purple-600 to-indigo-800'
                                : 'from-emerald-600 to-teal-800'
                          )
                        }`}>
                          {usr.roleType === 'president_assistant' ? (
                            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                          ) : usr.roleType === 'admin' ? (
                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
                          ) : (
                            usr.initials
                          )}
                        </div>

                        <div className="text-right leading-tight min-w-0 truncate">
                          <div className="text-xs font-bold truncate text-slate-800">
                            {usr.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                            {usr.role} • <span className="font-mono" dir="ltr">{usr.username}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            activePortal === 'president'
                              ? 'bg-amber-200/80 text-amber-900'
                              : activePortal === 'admin'
                                ? 'bg-purple-200/80 text-purple-900'
                                : 'bg-emerald-200/80 text-emerald-900'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>محدد</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            اختيار
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          Footer Info (Balanced padding, smooth responsive text)
         ========================================================================= */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-2 sm:py-3 px-2">
        <p className="font-semibold text-slate-300 text-[11px] sm:text-xs">
          المملكة العربية السعودية — جامعة المجمعة | الكلية التطبيقية
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
          جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات © {new Date().getFullYear()} — نظام الاتفاقيات الإلكتروني الموحد وإدارة الصلاحيات
        </p>
      </footer>

    </div>
  );
};
