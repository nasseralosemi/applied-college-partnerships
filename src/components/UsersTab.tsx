import React, { useState } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  KeyRound, 
  Sparkles,
  Edit,
  Trash2,
  Search,
  Users,
  Check,
  X,
  AlertTriangle,
  BadgeCheck,
  Crown
} from 'lucide-react';
import { SystemUser, UserRoleType, AuthUser, AccountStatus } from '../types';

interface UsersTabProps {
  users?: SystemUser[];
  currentUser?: AuthUser | null;
  onAddUser: (user: SystemUser) => void;
  onUpdateUser?: (user: SystemUser) => void;
  onDeleteUser?: (userId: string) => void;
  onSwitchUser?: (user: SystemUser) => void;
}

// Available roles specified in the platform requirements:
// (مساعد رئيس، مدير نظام، مسؤول وحدة، منسق)
export const ROLE_OPTIONS: {
  value: UserRoleType;
  label: string;
  roleTitle: string;
  department: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}[] = [
  {
    value: 'president_assistant',
    label: 'مساعد رئيس',
    roleTitle: 'مساعد رئيس الكلية التطبيقية',
    department: 'مكتب مساعد رئيس الكلية التطبيقية — جامعة المجمعة',
    description: 'واجهة تنفيذية مستقلة: الرسوم البيانية التفاعلية ومراجعة تقييم الشريك فقط',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-400'
  },
  {
    value: 'admin',
    label: 'مدير نظام',
    roleTitle: 'مدير النظام ومسؤول المنصة التقني',
    department: 'وحدة الشراكات وتقنية المعلومات — الكلية التطبيقية',
    description: 'واجهة مستقلة لإدارة الحسابات: إنشاء، تعديل، وحذف الحسابات وتعيين الصلاحيات',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: 'text-purple-800',
    borderColor: 'border-purple-400'
  },
  {
    value: 'partnerships_head',
    label: 'مسؤول وحدة',
    roleTitle: 'مسؤول وحدة الشراكات والاتفاقيات',
    department: 'وحدة الشراكات والاتفاقيات — الكلية التطبيقية',
    description: 'إدارة الاتفاقيات وعمليات التنفيذ والأنشطة والتقارير الشاملة',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-400'
  },
  {
    value: 'coordinator',
    label: 'منسق',
    roleTitle: 'منسق التدريب التعاوني والتوظيف',
    department: 'وحدة التدريب التعاوني والتوظيف — الكلية التطبيقية',
    description: 'توثيق ومتابعة الأنشطة التنفيذية واستبيانات رضا الشركاء',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeText: 'text-sky-800',
    borderColor: 'border-sky-400'
  }
];

export const UsersTab: React.FC<UsersTabProps> = ({
  users = [],
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  // Create User Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState<UserRoleType>('coordinator');
  const [showPassword, setShowPassword] = useState(false);

  // Form Validation & Feedback
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    password?: string;
  }>({});
  const [successUser, setSuccessUser] = useState<SystemUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search in users table
  const [searchQuery, setSearchQuery] = useState('');

  // Editing User Modal State
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRoleType, setEditRoleType] = useState<UserRoleType>('coordinator');
  const [editStatus, setEditStatus] = useState<AccountStatus>('نشط');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Deleting User Modal State
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  const selectedRoleConfig = ROLE_OPTIONS.find(r => r.value === selectedRoleType) || ROLE_OPTIONS[3];

  // Filtered users list
  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  // Calculate Account KPIs
  const totalAccounts = users.length;
  const activeAccounts = users.filter(u => u.status === 'نشط').length;
  const disabledAccounts = users.filter(u => u.status === 'معطل').length;

  // Handle Add User Form Submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessUser(null);
    
    // Validate required fields
    const newErrors: {
      fullName?: string;
      username?: string;
      password?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكامل أو المسمى';
    }

    if (!username.trim()) {
      newErrors.username = 'يرجى إدخال اسم المستخدم أو البريد الأكاديمي';
    }

    if (!password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    } else if (password.length < 4) {
      newErrors.password = 'يجب ألا تقل كلمة المرور عن 4 خانات';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      // Calculate initials
      const initials = fullName.trim()
        .split(' ')
        .filter(w => !['بن', 'بنت', 'آل', 'د.', 'أ.', 'م.'].includes(w))
        .slice(0, 2)
        .map(w => w[0])
        .join('.') || 'م.س';

      const email = username.includes('@') 
        ? username.trim().toLowerCase() 
        : `${username.trim().toLowerCase()}@mu.edu.sa`;

      const avatarColors = [
        'from-purple-600 to-indigo-800',
        'from-emerald-600 to-teal-800',
        'from-sky-600 to-indigo-800',
        'from-amber-600 to-amber-800',
        'from-teal-600 to-cyan-800'
      ];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const newUser: SystemUser = {
        id: `USR-MU-${Date.now().toString().slice(-4)}`,
        username: username.trim().toLowerCase().replace('@mu.edu.sa', ''),
        email,
        name: fullName.trim(),
        role: selectedRoleConfig.roleTitle,
        roleType: selectedRoleType,
        status: 'نشط',
        department: selectedRoleConfig.department,
        initials,
        avatarColor: randomColor,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'لم يسجل دخول بعد'
      };

      onAddUser(newUser);
      setSuccessUser(newUser);
      setIsSubmitting(false);

      // Reset form fields
      setFullName('');
      setUsername('');
      setPassword('');
      setSelectedRoleType('coordinator');
      setShowPassword(false);
    }, 250);
  };

  // Open Edit Modal
  const openEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setEditFullName(user.name);
    setEditUsername(user.username);
    setEditRoleType(user.roleType);
    setEditStatus(user.status || 'نشط');
    setEditNewPassword('');
    setShowEditPassword(false);
  };

  // Save Edited User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !onUpdateUser) return;

    if (!editFullName.trim() || !editUsername.trim()) {
      return;
    }

    const roleConfig = ROLE_OPTIONS.find(r => r.value === editRoleType) || ROLE_OPTIONS[3];
    const email = editUsername.includes('@') 
      ? editUsername.trim().toLowerCase() 
      : `${editUsername.trim().toLowerCase()}@mu.edu.sa`;

    const updated: SystemUser = {
      ...editingUser,
      name: editFullName.trim(),
      username: editUsername.trim().toLowerCase().replace('@mu.edu.sa', ''),
      email,
      roleType: editRoleType,
      role: roleConfig.roleTitle,
      department: roleConfig.department,
      status: editStatus
    };

    onUpdateUser(updated);
    setEditingUser(null);
  };

  // Confirm Delete User
  const handleConfirmDelete = () => {
    if (!userToDelete || !onDeleteUser) return;
    onDeleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. SYSTEM ADMIN HEADER (Clean, Professional, Dedicated exclusively to accounts)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/30 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>لوحة تحكم مدير النظام (System Admin Panel)</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                إدارة الحسابات والصلاحيات
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
                إنشاء وتعديل وحذف حسابات المستخدمين بالمنصة وتعيين الصلاحيات الرسمية (مساعد رئيس، مدير نظام، مسؤول وحدة، منسق)
              </p>
            </div>
          </div>

          {/* Quick Account Stats Badges (Accounts Only — No Partnerships stats) */}
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
              <div className="text-[11px] text-purple-200 font-medium">إجمالي الحسابات</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalAccounts}</div>
            </div>
            <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
              <div className="text-[11px] text-emerald-200 font-medium">حسابات نشطة</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{activeAccounts}</div>
            </div>
            {disabledAccounts > 0 && (
              <div className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                <div className="text-[11px] text-rose-200 font-medium">معطلة</div>
                <div className="text-xl sm:text-2xl font-black text-rose-300 mt-0.5">{disabledAccounts}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CREATE NEW USER FORM (Streamlined, Elegant, Direct)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                إضافة حساب مستخدم جديد
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                أدخل بيانات الحساب الجديد وحدد الصلاحية المطلوبة لحفظ الحساب فورياً بالنظام
              </p>
            </div>
          </div>
          
          <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
            نموذج إنشاء معتمد
          </span>
        </div>

        {/* Success Alert Banner */}
        {successUser && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-black text-emerald-950">
                  تم إنشاء وحفظ الحساب بنجاح في قاعدة البيانات!
                </div>
                <div className="text-xs text-emerald-800 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>الاسم:</strong> {successUser.name}</span>
                  <span><strong>اسم المستخدم:</strong> {successUser.username}</span>
                  <span><strong>الصلاحية:</strong> {successUser.role}</span>
                  <span><strong>البريد:</strong> {successUser.email}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSuccessUser(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                الاسم الكامل / المسمى <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="مثال: د. سلطان بن محمد القحطاني"
                  className={`w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-all ${
                    errors.fullName 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                  }`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Field 2: Username / Academic Email */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                اسم المستخدم (Username / البريد) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  placeholder="مثال: s.alqahtani أو s.alqahtani@mu.edu.sa"
                  dir="ltr"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border text-slate-800 text-sm text-left focus:outline-none focus:bg-white transition-all ${
                    errors.username 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                  }`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              {errors.username ? (
                <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.username}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">
                  سيتم تعيين البريد الأكاديمي تلقائياً بنطاق جامعة المجمعة @mu.edu.sa
                </p>
              )}
            </div>

            {/* Field 3: Password */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                كلمة المرور (Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="أدخل كلمة المرور (4 خانات كحد أدنى)"
                  dir="ltr"
                  className={`w-full pr-11 pl-11 py-3 rounded-2xl bg-slate-50 border text-slate-800 text-sm text-left focus:outline-none focus:bg-white transition-all ${
                    errors.password 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                  }`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Field 4: Role / Permission Dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                نوع الصلاحية / الدور (Role) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedRoleType}
                  onChange={(e) => setSelectedRoleType(e.target.value as UserRoleType)}
                  className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer appearance-none"
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.roleTitle}
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-purple-600 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                الصلاحية المحددة: {selectedRoleConfig.description}
              </p>
            </div>

          </div>

          {/* Form Actions: Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>يتم تفعيل الحساب وإتاحته لتسجيل الدخول فور الحفظ</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-900 text-white font-black text-sm shadow-lg shadow-purple-900/20 hover:shadow-xl transition-all transform active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري إنشاء وحفظ الحساب...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>حفظ وإنشاء الحساب</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* =========================================================================
          3. CURRENT USERS TABLE WITH EDIT & DELETE
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  الحسابات المسجلة الحالية
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  قائمة الحسابات المعتمدة في النظام مع خيارات التعديل وتحديث الصلاحيات والحذف
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، اسم المستخدم، أو الصلاحية..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto w-full mt-6 -mx-2 sm:mx-0">
          <table className="w-full text-right text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 rounded-r-xl">المستخدم</th>
                <th className="py-3 px-4">اسم المستخدم / البريد</th>
                <th className="py-3 px-4">الصلاحية / الدور</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">تاريخ الإنشاء</th>
                <th className="py-3 px-4 text-center rounded-l-xl">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">لا توجد حسابات مطابقة للبحث</p>
                    <p className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو أضف حساباً جديداً أعلاه</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = ROLE_OPTIONS.find(r => r.value === u.roleType) || ROLE_OPTIONS[3];
                  const isCurrentSessionUser = currentUser?.id === u.id || currentUser?.username === u.username;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-br ${
                            u.avatarColor || 'from-purple-600 to-indigo-800'
                          }`}>
                            {u.roleType === 'president_assistant' ? (
                              <Crown className="w-4 h-4 text-amber-300" />
                            ) : u.roleType === 'admin' ? (
                              <ShieldCheck className="w-4 h-4 text-purple-200" />
                            ) : (
                              u.initials || 'م'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrentSessionUser && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                                  أنت (الحساب الحالي)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {u.department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-bold text-slate-800" dir="ltr">{u.username}</div>
                        <div className="text-[11px] text-slate-400" dir="ltr">{u.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${roleConfig.badgeBg}`}>
                          {u.roleType === 'president_assistant' && <Crown className="w-3 h-3" />}
                          {u.roleType === 'admin' && <ShieldCheck className="w-3 h-3" />}
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.status === 'نشط'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'نشط' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{u.status || 'نشط'}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono" dir="ltr">
                        {u.createdAt || '2024-01-01'}
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                            title="تعديل بيانات الحساب والصلاحية"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (isCurrentSessionUser) {
                                alert('لا يمكن حذف حسابك النشط كمدير حالي للنظام للحفاظ على استمرارية الجلسة.');
                                return;
                              }
                              setUserToDelete(u);
                            }}
                            disabled={isCurrentSessionUser}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isCurrentSessionUser
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                            }`}
                            title={isCurrentSessionUser ? 'لا يمكن حذف الحساب المسجل به حالياً' : 'حذف هذا الحساب نهائياً'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================================================
          4. EDIT USER MODAL
         ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    تعديل بيانات الحساب
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تحديث الاسم والصلاحية وحالة الحساب
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم الكامل / المسمى
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المستخدم (Username)
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-left focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع الصلاحية / الدور
                </label>
                <select
                  value={editRoleType}
                  onChange={(e) => setEditRoleType(e.target.value as UserRoleType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.roleTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  حالة الحساب
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditStatus('نشط')}
                    className={`py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      editStatus === 'نشط'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>نشط ومفعّل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('معطل')}
                    className={`py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      editStatus === 'معطل'
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>معطل مؤقتاً</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تعيين كلمة مرور جديدة (اختياري)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    placeholder="اترك الحقل فارغاً للإبقاء على كلمة المرور السابقة"
                    dir="ltr"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-sm text-left focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-black text-slate-800">
              تأكيد حذف الحساب نهائياً
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب <strong>({userToDelete.name})</strong> باسم المستخدم <strong>({userToDelete.username})</strong>؟ لن يتمكن صاحب الحساب من تسجيل الدخول بعد الحذف.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
