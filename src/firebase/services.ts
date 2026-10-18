import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  db, 
  auth, 
  googleProvider, 
  OperationType, 
  handleFirestoreError 
} from './config';
import { 
  Agreement, 
  ExecutionActivity, 
  PartnerSurvey, 
  PartnerEvaluation, 
  SystemUser 
} from '../types';

export const COLLECTIONS = {
  AGREEMENTS: 'agreements',
  EXECUTIONS: 'executions',
  SURVEYS: 'surveys',
  EVALUATIONS: 'evaluations',
  USERS: 'users',
};

// -------------------------------------------------------------
// Authentication helpers
// -------------------------------------------------------------
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Firebase sign-out failed:', error);
    throw error;
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// Agreements CRUD & Subscriptions
// -------------------------------------------------------------
export function subscribeAgreements(
  onData: (agreements: Agreement[]) => void,
  onError?: (err: unknown) => void
) {
  const collRef = collection(db, COLLECTIONS.AGREEMENTS);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: Agreement[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Agreement, 'id'>) });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.AGREEMENTS);
    }
  );
}

export async function saveAgreementToCloud(agreement: Agreement): Promise<void> {
  const path = `${COLLECTIONS.AGREEMENTS}/${agreement.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.AGREEMENTS, agreement.id);
    await setDoc(docRef, agreement, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAgreementFromCloud(agreementId: string): Promise<void> {
  const path = `${COLLECTIONS.AGREEMENTS}/${agreementId}`;
  try {
    const docRef = doc(db, COLLECTIONS.AGREEMENTS, agreementId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Executions CRUD & Subscriptions
// -------------------------------------------------------------
export function subscribeExecutions(
  onData: (executions: ExecutionActivity[]) => void,
  onError?: (err: unknown) => void
) {
  const collRef = collection(db, COLLECTIONS.EXECUTIONS);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: ExecutionActivity[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<ExecutionActivity, 'id'>) });
      });
      items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.EXECUTIONS);
    }
  );
}

export async function saveExecutionToCloud(execution: ExecutionActivity): Promise<void> {
  const path = `${COLLECTIONS.EXECUTIONS}/${execution.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.EXECUTIONS, execution.id);
    await setDoc(docRef, execution, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExecutionFromCloud(executionId: string): Promise<void> {
  const path = `${COLLECTIONS.EXECUTIONS}/${executionId}`;
  try {
    const docRef = doc(db, COLLECTIONS.EXECUTIONS, executionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Surveys CRUD & Subscriptions
// -------------------------------------------------------------
export function subscribeSurveys(
  onData: (surveys: PartnerSurvey[]) => void,
  onError?: (err: unknown) => void
) {
  const collRef = collection(db, COLLECTIONS.SURVEYS);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: PartnerSurvey[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<PartnerSurvey, 'id'>) });
      });
      items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.SURVEYS);
    }
  );
}

export async function saveSurveyToCloud(survey: PartnerSurvey): Promise<void> {
  const path = `${COLLECTIONS.SURVEYS}/${survey.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURVEYS, survey.id);
    await setDoc(docRef, survey, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSurveyFromCloud(surveyId: string): Promise<void> {
  const path = `${COLLECTIONS.SURVEYS}/${surveyId}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURVEYS, surveyId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Evaluations CRUD & Subscriptions
// -------------------------------------------------------------
export function subscribeEvaluations(
  onData: (evaluations: PartnerEvaluation[]) => void,
  onError?: (err: unknown) => void
) {
  const collRef = collection(db, COLLECTIONS.EVALUATIONS);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: PartnerEvaluation[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<PartnerEvaluation, 'id'>) });
      });
      items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.EVALUATIONS);
    }
  );
}

export async function saveEvaluationToCloud(evaluation: PartnerEvaluation): Promise<void> {
  const path = `${COLLECTIONS.EVALUATIONS}/${evaluation.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.EVALUATIONS, evaluation.id);
    await setDoc(docRef, evaluation, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvaluationFromCloud(evaluationId: string): Promise<void> {
  const path = `${COLLECTIONS.EVALUATIONS}/${evaluationId}`;
  try {
    const docRef = doc(db, COLLECTIONS.EVALUATIONS, evaluationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// System Users CRUD & Subscriptions (Admin Accounts)
// -------------------------------------------------------------
export function subscribeUsers(
  onData: (users: SystemUser[]) => void,
  onError?: (err: unknown) => void
) {
  const collRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: SystemUser[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<SystemUser, 'id'>) });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.USERS);
    }
  );
}

export async function saveUserToCloud(user: SystemUser): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${user.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${userId}`;
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Initial Cloud Database Seeding
// -------------------------------------------------------------
export async function seedInitialFirestoreData(data: {
  agreements: Agreement[];
  executions: ExecutionActivity[];
  surveys: PartnerSurvey[];
  evaluations: PartnerEvaluation[];
  users: SystemUser[];
}): Promise<void> {
  try {
    // Check if agreements collection is empty
    const agrSnap = await getDocs(collection(db, COLLECTIONS.AGREEMENTS));
    if (agrSnap.empty && data.agreements.length > 0) {
      console.log('Seeding initial agreements to Firestore...');
      const batch = writeBatch(db);
      data.agreements.forEach(agr => {
        batch.set(doc(db, COLLECTIONS.AGREEMENTS, agr.id), agr);
      });
      await batch.commit();
    }

    // Check users collection
    const userSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (userSnap.empty && data.users.length > 0) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      data.users.forEach(u => {
        batch.set(doc(db, COLLECTIONS.USERS, u.id), u);
      });
      await batch.commit();
    }

    // Check executions
    const execSnap = await getDocs(collection(db, COLLECTIONS.EXECUTIONS));
    if (execSnap.empty && data.executions.length > 0) {
      const batch = writeBatch(db);
      data.executions.forEach(e => {
        batch.set(doc(db, COLLECTIONS.EXECUTIONS, e.id), e);
      });
      await batch.commit();
    }

    // Check surveys
    const survSnap = await getDocs(collection(db, COLLECTIONS.SURVEYS));
    if (survSnap.empty && data.surveys.length > 0) {
      const batch = writeBatch(db);
      data.surveys.forEach(s => {
        batch.set(doc(db, COLLECTIONS.SURVEYS, s.id), s);
      });
      await batch.commit();
    }

    // Check evaluations
    const evalSnap = await getDocs(collection(db, COLLECTIONS.EVALUATIONS));
    if (evalSnap.empty && data.evaluations.length > 0) {
      const batch = writeBatch(db);
      data.evaluations.forEach(ev => {
        batch.set(doc(db, COLLECTIONS.EVALUATIONS, ev.id), ev);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}
