import React from 'react';
import { 
  Printer, 
  LogOut, 
  GraduationCap
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentUser?: AuthUser | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogout 
}) => {
  return (
    <header className="no-print bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-lg border-b border-emerald-800/40 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-3.5 gap-4">
          
          {/* Right Side: University Emblem & System Title */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* College & University Emblem Badge */}
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 shadow-inner shadow-black/40 shrink-0">
              <GraduationCap className="w-6 h-6 text-amber-300 drop-shadow-xs" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-950 font-mono">
                MU
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  نظام إدارة الشراكات والاتفاقيات
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/25">
                  الكلية التطبيقية
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 font-medium mt-0.5">
                جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات
              </p>
            </div>
          </div>

          {/* Left Side: Logout Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Logout Button */}
            <button
              onClick={onLogout}
              id="btn-logout"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-400/30 font-bold text-xs transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
