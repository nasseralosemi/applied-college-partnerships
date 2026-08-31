export type SectorType = 'حكومي' | 'خاص' | 'غير ربحي' | 'شبه حكومي';

export type AgreementStatus = 'سارية' | 'جديدة' | 'منتهية' | 'قيد التجديد' | 'قيد التوقيع';

export type AgreementType = 'مذكرة تفاهم' | 'اتفاقية تعاون' | 'عقد شراكة استراتيجية' | 'بروتوكول تدريب وتوظيف';

export type ExecutionType = 
  | 'تدريب تعاوني' 
  | 'توظيف مباشر' 
  | 'ورشة عمل وتطوير' 
  | 'زيارة ميدانية' 
  | 'تطوير برنامج أكاديمي' 
  | 'هاكاثون / مسابقة' 
  | 'معرض مهني';

export type ExecutionStatus = 'مكتمل' | 'جاري التنفيذ' | 'مجدول' | 'ملغي';

export interface Agreement {
  id: string; // e.g. AGR-MU-001
  partnerName: string; // اسم الشريك / الجهة
  sector: SectorType; // القطاع
  agreementType: AgreementType; // نوع الاتفاقية
  domains: string[]; // مجالات التعاون
  status: AgreementStatus; // الحالة
  signDate: string; // تاريخ التوقيع (YYYY-MM-DD)
  expiryDate: string; // تاريخ الانتهاء (YYYY-MM-DD)
  collegeRepresentative: string; // ممثل الكلية
  partnerRepresentative: string; // ممثل الجهة الشريكة
  contactPhone: string; // رقم التواصل
  contactEmail: string; // البريد الإلكتروني
  city: string; // المدينة / المقر
  targetTrainingCount: number; // المستهدف للتدريب
  targetEmploymentCount: number; // المستهدف للتوظيف
  notes: string; // نبذة وملاحظات
  attachmentsCount?: number;
  documentUrl?: string; // رابط أو بيانات ملف PDF
  documentName?: string; // اسم ملف الـ PDF المرفق
  documentSize?: string; // حجم الملف
  documentUploadDate?: string; // تاريخ الرفع
  createdAt: string;
}

export interface ExecutionActivity {
  id: string; // e.g. EXE-MU-001
  agreementId: string; // ربط بالاتفاقية
  partnerName: string;
  title: string; // عنوان العملية / النشاط
  type: ExecutionType; // نوع النشاط
  date: string; // تاريخ التنفيذ
  location: string; // المقر
  traineesCount: number; // عدد مستفيدي التدريب
  employedCount: number; // عدد مستفيدي التوظيف
  coordinatorName: string; // منسق العملية
  status: ExecutionStatus;
  achievementRate: number; // نسبة الإنجاز % (0-100)
  notes: string;
  createdAt: string;
}

export interface PartnerSurvey {
  id: string; // e.g. SRV-MU-001
  agreementId: string; // ربط بالاتفاقية
  partnerName: string;
  respondentName: string; // اسم المسؤول لدى الشريك
  respondentRole: string; // المسمى الوظيفي
  date: string;
  // Criteria 1-5 scale
  academicPreparedness: number; // جاهزية وكفاءة طلبة الكلية المعرفية والتقنية
  professionalCommitment: number; // الانضباط والالتزام والمسؤولية المهنية
  collegeCoordination: number; // جودة التنسيق والتواصل مع الكلية
  programRelevance: number; // ملاءمة مخرجات البرامج لاحتياجات سوق العمل
  satisfactionLevel: number; // مستوى الرضا العام عن الشراكة
  willingToRenew: boolean; // الرغبة في تجديد واستمرار الشراكة
  strengths: string; // أبرز نقاط القوة
  recommendations: string; // التوصيات والملاحظات التحسينية
  createdAt: string;
}

export type EvaluationClassification = 
  | 'شريك استراتيجي متميز (أ)' 
  | 'شريك فعال (ب)' 
  | 'شريك يحتاج تحسين (ج)' 
  | 'شريك غير نشط (د)';

export type EvaluationDecision = 
  | 'تجديد الاتفاقية وتوسيع النطاق' 
  | 'الاستمرار مع المتابعة الدورية' 
  | 'إعادة توجيه وتحديث خطة العمل' 
  | 'إنهاء أو عدم تجديد الشراكة';

export interface PartnerEvaluation {
  id: string; // e.g. EVL-MU-001
  agreementId: string; // ربط بالاتفاقية
  partnerName: string;
  evaluatorName: string; // المقيم من وحدة الشراكات
  date: string;
  period: string; // e.g. العام الأكاديمي 1446هـ
  // Criteria 1-5 scale
  complianceWithTerms: number; // الالتزام ببنود مذكرة التفاهم
  trainingEnvironmentQuality: number; // جودة وتجهيز البيئة التدريبية
  mentorshipQuality: number; // كفاءة الإشراف والمتابعة الميدانية
  employmentConversion: number; // جدية الاستقطاب وتوظيف الخريجين
  responsiveness: number; // سرعة التجاوب والتعاون الإداري
  overallScore: number; // النسبة المئوية المحسوبة (0-100)
  classification: EvaluationClassification;
  decision: EvaluationDecision;
  notes: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
  initials: string;
}

export interface StatsData {
  totalAgreements: number;
  activeAgreements: number;
  expiredAgreements: number;
  newAgreements: number;
  totalTrainingBeneficiaries: number;
  totalEmploymentBeneficiaries: number;
}
