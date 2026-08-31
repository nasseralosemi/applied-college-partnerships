import React, { useState, useEffect, useMemo } from 'react';
import { 
  Agreement, 
  ExecutionActivity, 
  PartnerSurvey, 
  PartnerEvaluation, 
  StatsData,
  AuthUser
} from './types';
import { 
  INITIAL_AGREEMENTS, 
  INITIAL_EXECUTIONS, 
  INITIAL_SURVEYS, 
  INITIAL_EVALUATIONS 
} from './data/initialData';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { StatsBar } from './components/StatsBar';
import { TabsNav, TabId } from './components/TabsNav';
import { AgreementsTab } from './components/AgreementsTab';
import { ExecutionTab } from './components/ExecutionTab';
import { SurveyTab } from './components/SurveyTab';
import { EvaluationTab } from './components/EvaluationTab';
import { ReportsTab } from './components/ReportsTab';
import { CheckCircle } from 'lucide-react';

const STORAGE_KEYS = {
  AUTH_USER: 'mu_app_auth_user_v3_official',
  AGREEMENTS: 'mu_app_partnerships_agreements_v3_official',
  EXECUTIONS: 'mu_app_partnerships_executions_v3_official',
  SURVEYS: 'mu_app_partnerships_surveys_v3_official',
  EVALUATIONS: 'mu_app_partnerships_evaluations_v3_official',
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // State Initialization from LocalStorage or Defaults
  const [agreements, setAgreements] = useState<Agreement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_AGREEMENTS;
    } catch {
      return INITIAL_AGREEMENTS;
    }
  });

  const [executions, setExecutions] = useState<ExecutionActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);
      return saved ? JSON.parse(saved) : INITIAL_EXECUTIONS;
    } catch {
      return INITIAL_EXECUTIONS;
    }
  });

  const [surveys, setSurveys] = useState<PartnerSurvey[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SURVEYS);
      return saved ? JSON.parse(saved) : INITIAL_SURVEYS;
    } catch {
      return INITIAL_SURVEYS;
    }
  });

  const [evaluations, setEvaluations] = useState<PartnerEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
    } catch {
      return INITIAL_EVALUATIONS;
    }
  });

  // Active Tab & Selection State
  const [activeTab, setActiveTab] = useState<TabId>('agreements');
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync Auth User with LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
    } catch (e) {
      console.error(e);
    }
  }, [agreements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));
    } catch (e) {
      console.error(e);
    }
  }, [executions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    } catch (e) {
      console.error(e);
    }
  }, [surveys]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    } catch (e) {
      console.error(e);
    }
  }, [evaluations]);

  // Auth Handlers
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    showToast(`مرحباً بك، ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Dynamic Real-time Calculations for Live StatsBar
  const stats: StatsData = useMemo(() => {
    const totalAgreements = agreements.length;
    const activeAgreements = agreements.filter(a => a.status === 'سارية').length;
    const newAgreements = agreements.filter(a => a.status === 'جديدة').length;
    const expiredAgreements = agreements.filter(a => a.status === 'منتهية' || a.status === 'قيد التجديد').length;

    // Total beneficiaries dynamically computed from all execution operations
    const totalTrainingBeneficiaries = executions.reduce((sum, item) => sum + (item.traineesCount || 0), 0);
    const totalEmploymentBeneficiaries = executions.reduce((sum, item) => sum + (item.employedCount || 0), 0);

    return {
      totalAgreements,
      activeAgreements,
      expiredAgreements,
      newAgreements,
      totalTrainingBeneficiaries,
      totalEmploymentBeneficiaries
    };
  }, [agreements, executions]);

  // Selected Agreement Object
  const selectedAgreement = useMemo(() => {
    return agreements.find(a => a.id === selectedAgreementId) || null;
  }, [agreements, selectedAgreementId]);

  // Agreement Handlers
  const handleSelectAgreement = (agreement: Agreement) => {
    setSelectedAgreementId(agreement.id);
  };

  const handleClearSelectedAgreement = () => {
    setSelectedAgreementId(null);
  };

  const handleAddAgreement = (newAgr: Agreement) => {
    setAgreements(prev => [newAgr, ...prev]);
    setSelectedAgreementId(newAgr.id);
    showToast(`تمت إضافة اتفاقية جديدة بنجاح (${newAgr.partnerName})`);
  };

  const handleUpdateAgreement = (updatedAgr: Agreement) => {
    setAgreements(prev => prev.map(a => a.id === updatedAgr.id ? updatedAgr : a));
    // Also update partner name in related records
    setExecutions(prev => prev.map(e => e.agreementId === updatedAgr.id ? { ...e, partnerName: updatedAgr.partnerName } : e));
    setSurveys(prev => prev.map(s => s.agreementId === updatedAgr.id ? { ...s, partnerName: updatedAgr.partnerName } : s));
    setEvaluations(prev => prev.map(ev => ev.agreementId === updatedAgr.id ? { ...ev, partnerName: updatedAgr.partnerName } : ev));
    showToast(`تم تحديث بيانات الاتفاقية (${updatedAgr.partnerName})`);
  };

  const handleDeleteAgreement = (id: string) => {
    setAgreements(prev => prev.filter(a => a.id !== id));
    if (selectedAgreementId === id) {
      setSelectedAgreementId(null);
    }
    showToast('تم حذف الاتفاقية وتحديث الإحصائيات فوراً');
  };

  // Execution Handlers
  const handleAddExecution = (newExec: ExecutionActivity) => {
    setExecutions(prev => [newExec, ...prev]);
    showToast(`تم تسجيل عملية التنفيذ بنجاح وتحديث إجمالي المستفيدين (+${newExec.traineesCount} تدريب، +${newExec.employedCount} توظيف)`);
  };

  const handleUpdateExecution = (updatedExec: ExecutionActivity) => {
    setExecutions(prev => prev.map(e => e.id === updatedExec.id ? updatedExec : e));
    showToast('تم تحديث عملية التنفيذ بنجاح');
  };

  const handleDeleteExecution = (id: string) => {
    setExecutions(prev => prev.filter(e => e.id !== id));
    showToast('تم حذف عملية التنفيذ وتحديث المؤشرات الحية فوراً');
  };

  // Survey Handlers
  const handleAddSurvey = (newSurvey: PartnerSurvey) => {
    setSurveys(prev => [newSurvey, ...prev]);
    showToast(`تم حفظ استبيان رضا الشريك (${newSurvey.partnerName}) بنجاح`);
  };

  const handleUpdateSurvey = (updatedSurvey: PartnerSurvey) => {
    setSurveys(prev => prev.map(s => s.id === updatedSurvey.id ? updatedSurvey : s));
    showToast('تم تحديث استبيان رضا الشريك');
  };

  const handleDeleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    showToast('تم حذف الاستبيان');
  };

  // Evaluation Handlers
  const handleAddEvaluation = (newEval: PartnerEvaluation) => {
    setEvaluations(prev => [newEval, ...prev]);
    showToast(`تم اعتماد تقييم الشريك بنتيجة ${newEval.overallScore}% (${newEval.classification})`);
  };

  const handleUpdateEvaluation = (updatedEval: PartnerEvaluation) => {
    setEvaluations(prev => prev.map(ev => ev.id === updatedEval.id ? updatedEval : ev));
    showToast('تم تحديث تقييم الشريك');
  };

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(ev => ev.id !== id));
    showToast('تم حذف التقييم');
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* 1. System Header (Clean & Minimalist with Logout) */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Top Live Stats Bar (Fixed/Prominent Indicator) */}
      <StatsBar
        stats={stats}
      />

      {/* 3. Top Navigation Tabs */}
      <TabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        agreementsCount={agreements.length}
        executionsCount={executions.length}
        surveysCount={surveys.length}
        evaluationsCount={evaluations.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 4. Active Tab Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {activeTab === 'agreements' && (
          <AgreementsTab
            agreements={agreements}
            executions={executions}
            surveys={surveys}
            evaluations={evaluations}
            selectedAgreementId={selectedAgreementId}
            onSelectAgreement={handleSelectAgreement}
            onAddAgreement={handleAddAgreement}
            onUpdateAgreement={handleUpdateAgreement}
            onDeleteAgreement={handleDeleteAgreement}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'execution' && (
          <ExecutionTab
            agreements={agreements}
            executions={executions}
            selectedAgreementId={selectedAgreementId}
            onSelectAgreementId={setSelectedAgreementId}
            onAddExecution={handleAddExecution}
            onUpdateExecution={handleUpdateExecution}
            onDeleteExecution={handleDeleteExecution}
          />
        )}

        {activeTab === 'survey' && (
          <SurveyTab
            agreements={agreements}
            surveys={surveys}
            selectedAgreementId={selectedAgreementId}
            onSelectAgreementId={setSelectedAgreementId}
            onAddSurvey={handleAddSurvey}
            onUpdateSurvey={handleUpdateSurvey}
            onDeleteSurvey={handleDeleteSurvey}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationTab
            agreements={agreements}
            evaluations={evaluations}
            selectedAgreementId={selectedAgreementId}
            onSelectAgreementId={setSelectedAgreementId}
            onAddEvaluation={handleAddEvaluation}
            onUpdateEvaluation={handleUpdateEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            agreements={agreements}
            executions={executions}
            surveys={surveys}
            evaluations={evaluations}
            stats={stats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-700">
            نظام إدارة الشراكات والاتفاقيات — الكلية التطبيقية | جامعة المجمعة
          </p>
          <p className="text-slate-400">
            جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>

    </div>
  );
}
