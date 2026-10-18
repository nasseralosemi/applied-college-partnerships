import React from 'react';
import { 
  LogOut, 
  GraduationCap,
  Crown,
  ShieldCheck,
  User,
  Users,
  Cloud
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentUser?: AuthUser | null;
  onLogout: () => void;
  onOpenUsersTab?: () => void;
  onSwitchUserPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser,
  onLogout,
  onOpenUsersTab,
  onSwitchUserPrompt
}) => {
  const isAdmin = currentUser?.roleType === 'admin';
  const isPresidentAssistant = currentUser?.roleType === 'president_assistant';

  return (
    <header className="no-print bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-lg border-b border-emerald-800/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2 sm:gap-4">
          
          {/* Right Side: University Emblem & System Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* College & University Emblem Badge */}
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 shadow-inner shadow-black/40 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-xs" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-950 font-mono">
                MU
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-white truncate">
                  نظام إدارة الشراكات والاتفاقيات
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/25 shrink-0">
                  الكلية التطبيقية
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200/80 font-medium truncate mt-0.5">
                جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات
              </p>
            </div>
          </div>

          {/* Left Side: Current User Info & Logout Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Automatic Online Cloud Storage Status Badge */}
            <div 
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold"
              title="التخزين السحابي متصل وتلقائي — حفظ البيانات متزامن ومباشر"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">سحابي متصل ومباشر</span>
              <span className="sm:hidden">سحابي</span>
            </div>
            
            {/* Admin Direct Shortcut Button (Only visible for Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenUsersTab}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold text-xs transition-all cursor-pointer"
                title="لوحة تحكم مدير النظام لإدارة المستخدمين"
              >
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>إدارة الحسابات</span>
              </button>
            )}

            {/* Logged in User Pill */}
            {currentUser && (
              <div 
                onClick={isAdmin ? onOpenUsersTab : undefined}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-right max-w-[240px] transition-all ${
                  isPresidentAssistant
                    ? 'bg-amber-500/15 border-amber-400/30'
                    : isAdmin 
                      ? 'bg-purple-500/15 border-purple-400/30 hover:bg-purple-500/25 cursor-pointer'
                      : 'bg-white/10 border-white/15'
                }`}
                title={
                  isPresidentAssistant
                    ? 'المكتب التنفيذي لسعادة مساعد الرئيس'
                    : isAdmin 
                      ? 'مدير النظام — اضغط لفتح لوحة إدارة الحسابات'
                      : `الحساب الحالي: ${currentUser.role}`
                }
              >
                <div className={`w-7 h-7 rounded-lg text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border ${
                  isPresidentAssistant
                    ? 'bg-amber-600 border-amber-300'
                    : isAdmin
                      ? 'bg-purple-600 border-purple-300'
                      : 'bg-emerald-700 border-emerald-400/40'
                }`}>
                  {isPresidentAssistant ? (
                    <Crown className="w-3.5 h-3.5 text-amber-200" />
                  ) : isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                  ) : (
                    currentUser.initials || 'م'
                  )}
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] truncate font-medium ${
                    isPresidentAssistant ? 'text-amber-300 font-bold' : isAdmin ? 'text-purple-300 font-bold' : 'text-emerald-300'
                  }`}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              id="btn-logout"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-400/30 font-bold text-xs transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">تسجيل الخروج</span>
              <span className="inline xs:hidden sm:hidden text-[11px]">خروج</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
