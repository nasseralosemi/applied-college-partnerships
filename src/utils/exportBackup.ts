import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/index';
import { Agreement, SystemUser } from '../types';

/**
 * Helper to fetch latest live records directly from Firebase if in-memory state is empty.
 * READ-ONLY: Never writes, mutates, or deletes anything.
 */
async function fetchLatestFromFirestore<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as T);
    });
    return items;
  } catch (err) {
    console.warn(`Could not read ${collectionName} from Firestore:`, err);
    return [];
  }
}

/**
 * Exports all registered agreements and user accounts from Firebase to a standard Excel (.xlsx) workbook.
 * Creates dedicated sheets:
 * 1. "الاتفاقيات المسجلة" (Agreements)
 * 2. "الحسابات والمستخدمين" (Users & Accounts)
 */
export async function exportFirebaseBackupToExcel(
  agreements: Agreement[] = [],
  users: SystemUser[] = []
): Promise<{ success: boolean; agreementsCount: number; usersCount: number; error?: string }> {
  try {
    let finalAgreements = agreements;
    let finalUsers = users;

    // Fallback: If arrays are empty, read directly from live Firestore
    if (!finalAgreements || finalAgreements.length === 0) {
      finalAgreements = await fetchLatestFromFirestore<Agreement>('agreements');
    }
    if (!finalUsers || finalUsers.length === 0) {
      finalUsers = await fetchLatestFromFirestore<SystemUser>('users');
    }

    // 1. Format Agreements Sheet Data
    const agreementsRows = finalAgreements.map((agr, idx) => ({
      'م': idx + 1,
      'رقم الاتفاقية': agr.id || '',
      'اسم الشريك / الجهة': agr.partnerName || '',
      'نوع الاتفاقية': agr.agreementType || '',
      'القطاع': agr.sector || '',
      'حالة الاتفاقية': agr.status || '',
      'تاريخ التوقيع': agr.signDate || '',
      'تاريخ الانتهاء': agr.expiryDate || '',
      'مجالات التعاون': Array.isArray(agr.domains) ? agr.domains.join('، ') : (agr.domains || ''),
      'ممثل الكلية': agr.collegeRepresentative || '',
      'ممثل الشريك': agr.partnerRepresentative || '',
      'رقم التواصل': agr.contactPhone || '',
      'البريد الإلكتروني': agr.contactEmail || '',
      'المدينة / المقر': agr.city || '',
      'مستهدف التدريب': agr.targetTrainingCount ?? 0,
      'مستهدف التوظيف': agr.targetEmploymentCount ?? 0,
      'نبذة وملاحظات': agr.notes || '',
      'تاريخ الإضافة': agr.createdAt || ''
    }));

    // 2. Format Users & Accounts Sheet Data
    const usersRows = finalUsers.map((usr, idx) => ({
      'م': idx + 1,
      'معرف المستخدم': usr.id || '',
      'الاسم الكامل': usr.name || '',
      'اسم المستخدم': usr.username || '',
      'البريد الأكاديمي': usr.email || '',
      'المسمى الوظيفي': usr.role || '',
      'نوع الصلاحية': usr.roleType || '',
      'الإدارة / الوحدة': usr.department || '',
      'حالة الحساب': usr.status || '',
      'كلمة المرور': usr.password || '',
      'رقم الجوال': usr.phone || '',
      'آخر تسجيل دخول': usr.lastLogin || 'لم يسجل دخول بعد',
      'تاريخ إنشاء الحساب': usr.createdAt || ''
    }));

    // 3. Construct Workbook with SheetJS
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Agreements
    const agreementsSheet = XLSX.utils.json_to_sheet(
      agreementsRows.length > 0 
        ? agreementsRows 
        : [{ 'تنبيه': 'لا توجد اتفاقيات مسجلة حالياً في قاعدة البيانات' }]
    );
    agreementsSheet['!cols'] = [
      { wch: 6 },  // م
      { wch: 18 }, // رقم الاتفاقية
      { wch: 32 }, // اسم الشريك
      { wch: 24 }, // نوع الاتفاقية
      { wch: 14 }, // القطاع
      { wch: 14 }, // حالة الاتفاقية
      { wch: 14 }, // تاريخ التوقيع
      { wch: 14 }, // تاريخ الانتهاء
      { wch: 34 }, // مجالات التعاون
      { wch: 24 }, // ممثل الكلية
      { wch: 24 }, // ممثل الشريك
      { wch: 16 }, // رقم التواصل
      { wch: 28 }, // البريد الإلكتروني
      { wch: 16 }, // المدينة
      { wch: 14 }, // مستهدف التدريب
      { wch: 14 }, // مستهدف التوظيف
      { wch: 38 }, // نبذة وملاحظات
      { wch: 16 }, // تاريخ الإضافة
    ];
    XLSX.utils.book_append_sheet(workbook, agreementsSheet, 'الاتفاقيات المسجلة');

    // Sheet 2: Accounts & Users
    const usersSheet = XLSX.utils.json_to_sheet(
      usersRows.length > 0 
        ? usersRows 
        : [{ 'تنبيه': 'لا توجد حسابات مسجلة حالياً في قاعدة البيانات' }]
    );
    usersSheet['!cols'] = [
      { wch: 6 },  // م
      { wch: 20 }, // معرف المستخدم
      { wch: 30 }, // الاسم الكامل
      { wch: 20 }, // اسم المستخدم
      { wch: 30 }, // البريد الأكاديمي
      { wch: 34 }, // المسمى الوظيفي
      { wch: 22 }, // نوع الصلاحية
      { wch: 36 }, // الإدارة / الوحدة
      { wch: 14 }, // حالة الحساب
      { wch: 22 }, // كلمة المرور
      { wch: 18 }, // رقم الجوال
      { wch: 24 }, // آخر تسجيل دخول
      { wch: 18 }, // تاريخ إنشاء الحساب
    ];
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'الحسابات والمستخدمين');

    // File naming
    const today = new Date().toISOString().split('T')[0];
    const filename = `نسخة_احتياطية_منصة_الشراكات_جامعة_المجمعة_${today}.xlsx`;

    // Download file in browser
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      agreementsCount: finalAgreements.length,
      usersCount: finalUsers.length
    };
  } catch (error) {
    console.error('Error exporting Firebase backup:', error);
    return {
      success: false,
      agreementsCount: 0,
      usersCount: 0,
      error: error instanceof Error ? error.message : 'فشل تصدير النسخة الاحتياطية'
    };
  }
}
