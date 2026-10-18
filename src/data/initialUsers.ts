import { SystemUser } from '../types';

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'USR-MU-001',
    username: 'dr.saadoun',
    email: 'a.alsaadoun@mu.edu.sa',
    name: 'د. عبدالله بن علي السعدون',
    role: 'مساعد رئيس الكلية التطبيقية',
    roleType: 'president_assistant',
    status: 'نشط',
    department: 'مكتب مساعد رئيس الكلية التطبيقية — جامعة المجمعة',
    phone: '0164041001',
    initials: 'ع.س',
    avatarColor: 'from-amber-600 to-amber-800',
    lastLogin: 'منذ 10 دقائق',
    createdAt: '2023-01-15'
  },
  {
    id: 'USR-MU-002',
    username: 'admin',
    email: 'admin.partnerships@mu.edu.sa',
    name: 'م. عبدالإله بن سليمان العبداللطيف',
    role: 'مدير النظام ومسؤول المنصة التقني',
    roleType: 'admin',
    status: 'نشط',
    department: 'وحدة الشراكات وتقنية المعلومات — الكلية التطبيقية',
    phone: '0164041002',
    initials: 'ع.ل',
    avatarColor: 'from-emerald-600 to-teal-800',
    lastLogin: 'الآن',
    createdAt: '2023-01-10'
  },
  {
    id: 'USR-MU-003',
    username: 'shayea.s',
    email: 's.alshayea@mu.edu.sa',
    name: 'د. سارة بنت عبدالعزيز الشايع',
    role: 'رئيسة وحدة الشراكات والاتفاقيات',
    roleType: 'partnerships_head',
    status: 'نشط',
    department: 'وحدة الشراكات والاتفاقيات — الكلية التطبيقية',
    phone: '0164041003',
    initials: 'س.ش',
    avatarColor: 'from-teal-600 to-cyan-800',
    lastLogin: 'أمس 02:40 م',
    createdAt: '2023-02-01'
  },
  {
    id: 'USR-MU-004',
    username: 'tamimi.f',
    email: 'f.altamimi@mu.edu.sa',
    name: 'أ. فهد بن ناصر التميمي',
    role: 'منسق التدريب التعاوني والميداني',
    roleType: 'coordinator',
    status: 'نشط',
    department: 'وحدة التدريب التعاوني والتوظيف — الكلية التطبيقية',
    phone: '0164041004',
    initials: 'ف.ت',
    avatarColor: 'from-sky-600 to-indigo-800',
    lastLogin: 'منذ 3 ساعات',
    createdAt: '2023-03-12'
  },
  {
    id: 'USR-MU-005',
    username: 'swilem.m',
    email: 'm.alswilem@mu.edu.sa',
    name: 'د. منى بنت إبراهيم السويلم',
    role: 'مراجع ومقيم جودة الشراكات والاعتماد',
    roleType: 'reviewer',
    status: 'نشط',
    department: 'وحدة التطوير والجودة — الكلية التطبيقية',
    phone: '0164041005',
    initials: 'م.س',
    avatarColor: 'from-purple-600 to-indigo-800',
    lastLogin: 'منذ يومين',
    createdAt: '2023-05-18'
  },
  {
    id: 'USR-MU-006',
    username: 'mohraj.k',
    email: 'k.almohraj@mu.edu.sa',
    name: 'د. خالد بن محمد المحرج',
    role: 'وكيل الشؤون التعليمية والأكاديمية',
    roleType: 'reviewer',
    status: 'معطل',
    department: 'وكالة الكلية للشؤون التعليمية — الكلية التطبيقية',
    phone: '0164041006',
    initials: 'خ.م',
    avatarColor: 'from-slate-600 to-slate-800',
    lastLogin: 'منذ شهر',
    createdAt: '2023-06-01'
  }
];

export const ROLE_LABELS: Record<string, { label: string; color: string; badgeClass: string }> = {
  president_assistant: {
    label: 'مساعد الرئيس',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300'
  },
  admin: {
    label: 'مدير النظام (Admin)',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300'
  },
  partnerships_head: {
    label: 'مسؤول وحدة الشراكات',
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-900 border-teal-300'
  },
  coordinator: {
    label: 'منسق تدريب وتوظيف',
    color: 'sky',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-300'
  },
  reviewer: {
    label: 'مراجع ومدقق جودة',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-300'
  }
};
