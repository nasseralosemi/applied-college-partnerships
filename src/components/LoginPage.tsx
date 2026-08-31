import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'USR-001',
    username: 'dr.saadoun',
    name: 'د. عبدالله بن علي السعدون',
    role: 'مساعد رئيس الكلية التطبيقية - المسؤول عن وحدة الشراكات',
    department: 'الكلية التطبيقية — جامعة المجمعة',
    initials: 'ع.س'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('dr.saadoun');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user or fallback to custom authenticated user
      const matchedUser = DEFAULT_USERS.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      const authenticatedUser: AuthUser = matchedUser || {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        username: username.trim(),
        name: username.trim().includes('admin') ? 'مدير نظام الشراكات' : username.trim(),
        role: 'مسؤول إدارة الاتفاقيات والتدريب',
        department: 'الكلية التطبيقية — جامعة المجمعة',
        initials: username.trim().slice(0, 2).toUpperCase()
      };

      setIsLoading(false);
      onLogin(authenticatedUser);
    }, 450);
  };

  const handleSelectQuickUser = (user: AuthUser) => {
    setUsername(user.username);
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* Top University Brand Sub-Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-xs sm:text-sm font-bold tracking-tight">
              جامعة المجمعة | Majmaah University
            </div>
            <div className="text-emerald-300 text-[11px] font-medium">
              الكلية التطبيقية — وحدة الشراكات
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>بوابة الدخول الموحد الآمنة</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="my-auto max-w-md w-full mx-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
          
          {/* Top Decorative Emerald Accent */}
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400"></div>

          {/* Card Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg mb-3">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              نظام إدارة الشراكات والاتفاقيات
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              تسجيل الدخول إلى لوحة المتابعة وإحصاءات التدريب والتوظيف
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
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
                اسم المستخدم / البريد الأكاديمي
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="login-username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: dr.saadoun"
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور
                </label>
                <span className="text-[11px] text-emerald-700 font-medium cursor-pointer hover:underline">
                  نسيت كلمة المرور؟
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
                  className="w-full pr-10 pl-11 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all font-mono"
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

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ التحقق وتجهيز اللوحة...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول للمنصة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Access Pills */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500">
                أو اختر حساباً تجريبياً جاهزاً للدخول السريع:
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                تجريبي
              </span>
            </div>

            <div className="space-y-1.5">
              {DEFAULT_USERS.map((usr) => (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => handleSelectQuickUser(usr)}
                  className={`w-full text-right p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    username === usr.username
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {usr.initials}
                    </div>
                    <div className="text-right leading-tight">
                      <div className="text-xs">{usr.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{usr.role}</div>
                    </div>
                  </div>
                  {username === usr.username && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-400 py-3">
        <p className="font-semibold text-slate-300">
          المملكة العربية السعودية — جامعة المجمعة | الكلية التطبيقية
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات © {new Date().getFullYear()} — نظام الاتفاقيات الإلكتروني الموحد
        </p>
      </div>

    </div>
  );
};
