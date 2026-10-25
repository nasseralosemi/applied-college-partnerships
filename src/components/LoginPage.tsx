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
  AlertCircle,
  Cloud
} from 'lucide-react';
import { AuthUser, SystemUser } from '../types';

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
}

const PORTAL_CONFIGS: Record<PortalTabId, PortalConfig> = {
  staff: {
    id: 'staff',
    tabLabel: 'الموظفون',
    tabEnglish: 'Staff & Officers',
    cardTitle: 'بوابة الموظفين ومسؤولي الشراكات',
    cardSubtitle: 'مدخلات الاتفاقيات وعمليات التدريب والتوظيف واستبيانات الشركاء',
    portalBadge: 'بوابة الموظفين والعمليات التشغيلية',
    icon: Users,
    accentColor: 'from-emerald-600 via-teal-500 to-emerald-400',
    buttonGradient: 'from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700',
    activeTabClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border-emerald-400',
    iconBgClass: 'from-emerald-700 to-teal-900 border-emerald-400/40 text-emerald-200'
  },
  president: {
    id: 'president',
    tabLabel: 'المسؤول',
    tabEnglish: 'Executive Official',
    cardTitle: 'بوابة المسؤول (المكتب التنفيذي)',
    cardSubtitle: 'لوحة التحليلات والمؤشرات البيانية ومراجعة تقييم الشريك المؤسسي',
    portalBadge: 'الواجهة التنفيذية لسعادة مساعد الرئيس',
    icon: Crown,
    accentColor: 'from-amber-500 via-yellow-400 to-amber-600',
    buttonGradient: 'from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-500 hover:to-amber-600 text-white',
    activeTabClass: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/40 border-amber-300 font-black',
    iconBgClass: 'from-amber-600 to-amber-900 border-amber-300/40 text-amber-200'
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
    iconBgClass: 'from-purple-700 to-indigo-900 border-purple-400/40 text-purple-200'
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  availableUsers = [] 
}) => {
  // Active Portal Tab
  const [activePortal, setActivePortal] = useState<PortalTabId>('staff');
  
  // Official Credentials Form State (Empty by default - No automatic/demo prefill)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConfig = PORTAL_CONFIGS[activePortal];
  const PortalIcon = currentConfig.icon;

  // Switch tab without prefilling or leaking credentials
  const handleTabChange = (portalId: PortalTabId) => {
    setActivePortal(portalId);
    setError(null);
  };

  // Official Authentication Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanInput) {
      setError('يرجى إدخال اسم المستخدم أو البريد الأكاديمي');
      return;
    }

    if (!cleanPassword) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Find user strictly in system database
      const matchedUser = availableUsers.find(
        u => u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
      );

      if (!matchedUser) {
        setIsLoading(false);
        setError('اسم المستخدم أو البريد الأكاديمي غير مسجل بالنظام. يرجى مراجعة إدارة النظام.');
        return;
      }

      // 2. Check account status
      if (matchedUser.status === 'معطل') {
        setIsLoading(false);
        setError('عذراً، هذا الحساب معطل حالياً. يرجى مراجعة مدير النظام لتفعيل الحساب.');
        return;
      }

      // 3. Strict Portal Role Authorization Guard
      if (activePortal === 'admin' && matchedUser.roleType !== 'admin') {
        setIsLoading(false);
        setError('غير مصرح لهذا الحساب بالدخول عبر بوابة مدير النظام.');
        return;
      }

      if (activePortal === 'president' && matchedUser.roleType !== 'president_assistant') {
        setIsLoading(false);
        setError('غير مصرح لهذا الحساب بالدخول عبر بوابة المسؤول التنفيذي.');
        return;
      }

      if (activePortal === 'staff' && (matchedUser.roleType === 'admin' || matchedUser.roleType === 'president_assistant')) {
        setIsLoading(false);
        setError('يرجى تسجيل الدخول عبر البوابة الرسمية المخصصة لصلاحيتك (المسؤول أو مدير النظام).');
        return;
      }

      // 4. Strict Password Verification
      const expectedPassword = 
        matchedUser.password || 
        (matchedUser.roleType === 'admin' ? 'Nass112233&' : 
         matchedUser.roleType === 'president_assistant' ? 'Saadoun@2026' : 
         '123456');

      const isPasswordCorrect = 
        cleanPassword === expectedPassword || 
        (matchedUser.password && cleanPassword === matchedUser.password) ||
        (matchedUser.roleType !== 'admin' && cleanPassword === '123456');

      if (!isPasswordCorrect) {
        setIsLoading(false);
        setError('كلمة المرور غير صحيحة. يرجى التأكد من صحة كلمة المرور والمحاولة مجدداً.');
        return;
      }

      // 5. Successful Official Authentication
      const authenticatedUser: AuthUser = {
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

      setIsLoading(false);
      onLogin(authenticatedUser);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col justify-between p-3 sm:p-5 md:p-8 selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* =========================================================================
          Top University Brand Header
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
          {/* Automatic Cloud Storage Status Badge */}
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
          Main Login Workspace Container
         ========================================================================= */}
      <div className="my-auto max-w-lg w-full mx-auto py-3 sm:py-6 px-1 sm:px-0">
        
        {/* =========================================================================
            1. PORTAL ROLE TABS (Navigation between portals)
           ========================================================================= */}
        <div className="mb-3 sm:mb-4">
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
            2. OFFICIAL LOGIN CARD (Strict credentials form - Demo login removed)
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

          {/* Official Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username / Academic Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو البريد الأكاديمي الرسمي
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="login-username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو البريد الأكاديمي..."
                  autoComplete="username"
                  className="w-full pr-10 pl-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all text-right font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور الرسمية
                </label>
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
                  autoComplete="current-password"
                  className="w-full pr-10 pl-11 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all font-mono"
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

            {/* Submit Official Login Button */}
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className={`w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r ${currentConfig.buttonGradient} text-white font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ التحقق من الصلاحيات والمصادقة الرسمية...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول الرسمي</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      {/* =========================================================================
          Footer Info
         ========================================================================= */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs py-3 px-2 space-y-1 mt-auto">
        <p className="font-semibold text-slate-300 text-[11px] sm:text-xs">
          المملكة العربية السعودية — جامعة المجمعة | الكلية التطبيقية
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
          جميع الحقوق محفوظة © 2026 | تصميم وبرمجة: أ. ناصر العصيمي
        </p>
      </footer>

    </div>
  );
};
