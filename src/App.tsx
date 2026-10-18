import React, { useState, useEffect, useMemo } from 'react';
import { 
  Agreement, 
  ExecutionActivity, 
  PartnerSurvey, 
  PartnerEvaluation, 
  StatsData,
  AuthUser,
  SystemUser
} from './types';
import { 
  INITIAL_AGREEMENTS, 
  INITIAL_EXECUTIONS, 
  INITIAL_SURVEYS, 
  INITIAL_EVALUATIONS 
} from './data/initialData';
import { INITIAL_USERS } from './data/initialUsers';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { StatsBar } from './components/StatsBar';
import { TabsNav, TabId } from './components/TabsNav';
import { AgreementsTab } from './components/AgreementsTab';
import { ExecutionTab } from './components/ExecutionTab';
import { SurveyTab } from './components/SurveyTab';
import { EvaluationTab } from './components/EvaluationTab';
import { ReportsTab } from './components/ReportsTab';
import { PresidentDashboardTab } from './components/PresidentDashboardTab';
import { UsersTab } from './components/UsersTab';
import { CheckCircle } from 'lucide-react';
import { 
  seedDatabaseIfEmpty,
  subscribeToUsers,
  subscribeToAgreements,
  subscribeToExecutions,
  subscribeToSurveys,
  subscribeToEvaluations,
  saveUserToCloud,
  deleteUserFromCloud,
  saveAgreementToCloud,
  deleteAgreementFromCloud,
  saveExecutionToCloud,
  deleteExecutionFromCloud,
  saveSurveyToCloud,
  deleteSurveyFromCloud,
  saveEvaluationToCloud,
  deleteEvaluationFromCloud
} from './firebase/firestoreService';

const STORAGE_KEYS = {
  AUTH_USER: 'mu_app_auth_user_v3_official',
  AGREEMENTS: 'mu_app_partnerships_agreements_v3_official',
  EXECUTIONS: 'mu_app_partnerships_executions_v3_official',
  SURVEYS: 'mu_app_partnerships_surveys_v3_official',
  EVALUATIONS: 'mu_app_partnerships_evaluations_v3_official',
  USERS: 'mu_app_partnerships_users_v3_official',
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

  // System Users State
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Agreements and Operational State
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

  // Active Tab & Selection State based on initial user role
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (!currentUser) return 'agreements';
    if (currentUser.roleType === 'president_assistant') return 'president-dashboard';
    if (currentUser.roleType === 'admin') return 'users';
    return 'agreements';
  });

  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Real-time Online Cloud Storage Synchronization (Firestore)
  useEffect(() => {
    let isMounted = true;

    // 1. Auto-seed cloud collections if database is empty on first run
    seedDatabaseIfEmpty();

    // 2. Real-time Listeners for instant multi-user cloud synchronization
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (isMounted && cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    });

    const unsubAgreements = subscribeToAgreements((cloudAgreements) => {
      if (isMounted && cloudAgreements && cloudAgreements.length > 0) {
        setAgreements(cloudAgreements);
      }
    });

    const unsubExecutions = subscribeToExecutions((cloudExecutions) => {
      if (isMounted && cloudExecutions && cloudExecutions.length > 0) {
        setExecutions(cloudExecutions);
      }
    });

    const unsubSurveys = subscribeToSurveys((cloudSurveys) => {
      if (isMounted && cloudSurveys && cloudSurveys.length > 0) {
        setSurveys(cloudSurveys);
      }
    });

    const unsubEvaluations = subscribeToEvaluations((cloudEvaluations) => {
      if (isMounted && cloudEvaluations && cloudEvaluations.length > 0) {
        setEvaluations(cloudEvaluations);
      }
    });

    return () => {
      isMounted = false;
      unsubUsers();
      unsubAgreements();
      unsubExecutions();
      unsubSurveys();
      unsubEvaluations();
    };
  }, []);

  // Role-Based Access Guard: Ensure user cannot remain on forbidden tabs
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.roleType === 'president_assistant') {
      // President Assistant is locked exclusively to Executive Dashboard
      if (activeTab !== 'president-dashboard') {
        setActiveTab('president-dashboard');
      }
    } else if (currentUser.roleType === 'admin') {
      // Admin has unrestricted access
    } else {
      // Employees / Coordinators: Evaluation tab is fully permitted. Only President Dashboard and Admin Users are restricted.
      if (activeTab === 'president-dashboard' || activeTab === 'users') {
        setActiveTab('agreements');
      }
    }
  }, [currentUser, activeTab]);

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

  // Sync Users with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  // Sync Agreements with LocalStorage
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
    if (user.roleType === 'president_assistant') {
      // 1. Automatically direct President Assistant to their dedicated Executive Dashboard
      setActiveTab('president-dashboard');
    } else if (user.roleType === 'admin') {
      // 3. Automatically direct Admin to their dedicated Users & Accounts Management Panel
      setActiveTab('users');
    } else {
      // 2. Employees land directly on Agreements tab
      setActiveTab('agreements');
    }
    showToast(`مرحباً بك، ${user.name} (${user.role})`);
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

  // Agreement Handlers
  const handleSelectAgreement = (agreement: Agreement) => {
    setSelectedAgreementId(agreement.id);
  };

  const handleAddAgreement = (newAgr: Agreement) => {
    setAgreements(prev => [newAgr, ...prev]);
    setSelectedAgreementId(newAgr.id);
    saveAgreementToCloud(newAgr);
    showToast(`تمت إضافة الاتفاقية وحفظها سحابياً بنجاح (${newAgr.partnerName})`);
  };

  const handleUpdateAgreement = (updatedAgr: Agreement) => {
    setAgreements(prev => prev.map(a => a.id === updatedAgr.id ? updatedAgr : a));
    // Also update partner name in related records
    setExecutions(prev => prev.map(e => e.agreementId === updatedAgr.id ? { ...e, partnerName: updatedAgr.partnerName } : e));
    setSurveys(prev => prev.map(s => s.agreementId === updatedAgr.id ? { ...s, partnerName: updatedAgr.partnerName } : s));
    setEvaluations(prev => prev.map(ev => ev.agreementId === updatedAgr.id ? { ...ev, partnerName: updatedAgr.partnerName } : ev));
    saveAgreementToCloud(updatedAgr);
    showToast(`تم تحديث وحفظ بيانات الاتفاقية سحابياً (${updatedAgr.partnerName})`);
  };

  const handleDeleteAgreement = (id: string) => {
    setAgreements(prev => prev.filter(a => a.id !== id));
    if (selectedAgreementId === id) {
      setSelectedAgreementId(null);
    }
    deleteAgreementFromCloud(id);
    showToast('تم حذف الاتفاقية وتحديث قاعدة البيانات السحابية فوراً');
  };

  // Execution Handlers
  const handleAddExecution = (newExec: ExecutionActivity) => {
    setExecutions(prev => [newExec, ...prev]);
    saveExecutionToCloud(newExec);
    showToast(`تم تسجيل وحفظ عملية التنفيذ سحابياً (+${newExec.traineesCount} تدريب، +${newExec.employedCount} توظيف)`);
  };

  const handleUpdateExecution = (updatedExec: ExecutionActivity) => {
    setExecutions(prev => prev.map(e => e.id === updatedExec.id ? updatedExec : e));
    saveExecutionToCloud(updatedExec);
    showToast('تم تحديث عملية التنفيذ سحابياً بنجاح');
  };

  const handleDeleteExecution = (id: string) => {
    setExecutions(prev => prev.filter(e => e.id !== id));
    deleteExecutionFromCloud(id);
    showToast('تم حذف عملية التنفيذ وتحديث المؤشرات السحابية فوراً');
  };

  // Survey Handlers
  const handleAddSurvey = (newSurvey: PartnerSurvey) => {
    setSurveys(prev => [newSurvey, ...prev]);
    saveSurveyToCloud(newSurvey);
    showToast(`تم حفظ استبيان رضا الشريك سحابياً (${newSurvey.partnerName}) بنجاح`);
  };

  const handleUpdateSurvey = (updatedSurvey: PartnerSurvey) => {
    setSurveys(prev => prev.map(s => s.id === updatedSurvey.id ? updatedSurvey : s));
    saveSurveyToCloud(updatedSurvey);
    showToast('تم تحديث استبيان رضا الشريك سحابياً');
  };

  const handleDeleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    deleteSurveyFromCloud(id);
    showToast('تم حذف الاستبيان من السحابة');
  };

  // Evaluation Handlers
  const handleAddEvaluation = (newEval: PartnerEvaluation) => {
    setEvaluations(prev => [newEval, ...prev]);
    saveEvaluationToCloud(newEval);
    showToast(`تم اعتماد وحفظ تقييم الشريك سحابياً بنتيجة ${newEval.overallScore}% (${newEval.classification})`);
  };

  const handleUpdateEvaluation = (updatedEval: PartnerEvaluation) => {
    setEvaluations(prev => prev.map(ev => ev.id === updatedEval.id ? updatedEval : ev));
    saveEvaluationToCloud(updatedEval);
    showToast('تم تحديث تقييم الشريك سحابياً');
  };

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(ev => ev.id !== id));
    deleteEvaluationFromCloud(id);
    showToast('تم حذف التقييم من السحابة');
  };

  // Users Handlers (Admin Accounts Management)
  const handleAddUser = (newUser: SystemUser) => {
    setUsers(prev => [newUser, ...prev]);
    saveUserToCloud(newUser);
    showToast(`تم إنشاء وتفعيل حساب (${newUser.name}) وحفظه سحابياً بنجاح`);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    saveUserToCloud(updatedUser);
    // If updating current user, sync currentUser
    if (currentUser && currentUser.username === updatedUser.username) {
      setCurrentUser({
        ...currentUser,
        name: updatedUser.name,
        role: updatedUser.role,
        roleType: updatedUser.roleType,
        department: updatedUser.department,
        initials: updatedUser.initials,
        status: updatedUser.status
      });
    }
    showToast(`تم حفظ وتحديث تعديلات حساب (${updatedUser.name}) سحابياً`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteUserFromCloud(userId);
    showToast(`تم حذف حساب ${target ? target.name : ''} من السحابة بنجاح`);
  };

  const handleSwitchUser = (targetUser: SystemUser) => {
    const switchedAuthUser: AuthUser = {
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      roleType: targetUser.roleType,
      department: targetUser.department,
      initials: targetUser.initials,
      status: targetUser.status
    };
    setCurrentUser(switchedAuthUser);
    if (targetUser.roleType === 'president_assistant') {
      setActiveTab('president-dashboard');
    } else if (targetUser.roleType === 'admin') {
      setActiveTab('users');
    } else {
      setActiveTab('agreements');
    }
    showToast(`تم التبديل بنجاح إلى: ${targetUser.name} (${targetUser.role})`);
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} availableUsers={users} />;
  }

  const isPresidentAssistant = currentUser.roleType === 'president_assistant';
  const isAdmin = currentUser.roleType === 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* 1. System Header (Clean & Minimalist with Role Badges and Logout) */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUsersTab={isAdmin ? () => setActiveTab('users') : undefined}
      />

      {/* 2. Top Live Stats Bar (Rendered for employees only; completely hidden for President Assistant and Admin) */}
      {!isPresidentAssistant && !isAdmin && (
        <StatsBar
          stats={stats}
        />
      )}

      {/* 3. Top Navigation Tabs (Role-Based Visibility strictly enforced) */}
      <TabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        agreementsCount={agreements.length}
        executionsCount={executions.length}
        surveysCount={surveys.length}
        evaluationsCount={evaluations.length}
        usersCount={users.length}
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

      {/* 4. Main Workspace Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        
        {/* =========================================================================
            ADMIN VIEW (Dedicated exclusively to System Users & Accounts Management)
            All partnerships stats, tabs, and evaluations are completely removed.
           ========================================================================= */}
        {isAdmin && (
          <UsersTab
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSwitchUser={handleSwitchUser}
          />
        )}

        {/* Tab 1: President Assistant Executive Dashboard (Exclusive for Dr. Abdullah Al-Saadoun) */}
        {!isAdmin && activeTab === 'president-dashboard' && (
          <PresidentDashboardTab
            agreements={agreements}
            executions={executions}
            surveys={surveys}
            evaluations={evaluations}
            stats={stats}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectAgreement={handleSelectAgreement}
          />
        )}

        {/* Tab 2: Agreements & Partnerships */}
        {!isAdmin && activeTab === 'agreements' && (
          <AgreementsTab
            agreements={agreements}
            executions={executions}
            surveys={surveys}
            evaluations={evaluations}
            selectedAgreementId={selectedAgreementId}
            canAccessEvaluation={true}
            onSelectAgreement={handleSelectAgreement}
            onAddAgreement={handleAddAgreement}
            onUpdateAgreement={handleUpdateAgreement}
            onDeleteAgreement={handleDeleteAgreement}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab 3: Execution & Operations */}
        {!isAdmin && activeTab === 'execution' && (
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

        {/* Tab 4: Partner Satisfaction Survey */}
        {!isAdmin && activeTab === 'survey' && (
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

        {/* Tab 5: Institutional Evaluation */}
        {!isAdmin && activeTab === 'evaluation' && (
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

        {/* Tab 6: Comprehensive Reports */}
        {!isAdmin && activeTab === 'reports' && (
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
            جامعة المجمعة | الكلية التطبيقية - وحدة الشراكات © {new Date().getFullYear()} — نظام إدارة الصلاحيات والأدوار المعتمد
          </p>
        </div>
      </footer>

    </div>
  );
}
