import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './index';
import { Agreement, ExecutionActivity, PartnerSurvey, PartnerEvaluation, SystemUser } from '../types';
import { 
  INITIAL_AGREEMENTS, 
  INITIAL_EXECUTIONS, 
  INITIAL_SURVEYS, 
  INITIAL_EVALUATIONS 
} from '../data/initialData';
import { INITIAL_USERS } from '../data/initialUsers';

export const COLLECTIONS = {
  USERS: 'users',
  AGREEMENTS: 'agreements',
  EXECUTIONS: 'executions',
  SURVEYS: 'surveys',
  EVALUATIONS: 'evaluations',
};

// -------------------------------------------------------------
// Auto-Seed Firestore when collections are empty on first run
// -------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check and seed Users
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty) {
      console.log('Seeding cloud users collection...');
      const batch = writeBatch(db);
      for (const user of INITIAL_USERS) {
        const userRef = doc(db, COLLECTIONS.USERS, user.id);
        batch.set(userRef, user);
      }
      await batch.commit();
    }

    // 2. Check and seed Agreements
    const agrSnap = await getDocs(collection(db, COLLECTIONS.AGREEMENTS));
    if (agrSnap.empty) {
      console.log('Seeding cloud agreements collection...');
      // Firestore batch limit is 500 operations
      const batch = writeBatch(db);
      for (const agr of INITIAL_AGREEMENTS) {
        const agrRef = doc(db, COLLECTIONS.AGREEMENTS, agr.id);
        batch.set(agrRef, agr);
      }
      await batch.commit();
    }

    // 3. Check and seed Executions
    const execSnap = await getDocs(collection(db, COLLECTIONS.EXECUTIONS));
    if (execSnap.empty) {
      console.log('Seeding cloud executions collection...');
      const batch = writeBatch(db);
      for (const exec of INITIAL_EXECUTIONS) {
        const execRef = doc(db, COLLECTIONS.EXECUTIONS, exec.id);
        batch.set(execRef, exec);
      }
      await batch.commit();
    }

    // 4. Check and seed Surveys
    const survSnap = await getDocs(collection(db, COLLECTIONS.SURVEYS));
    if (survSnap.empty) {
      console.log('Seeding cloud surveys collection...');
      const batch = writeBatch(db);
      for (const s of INITIAL_SURVEYS) {
        const sRef = doc(db, COLLECTIONS.SURVEYS, s.id);
        batch.set(sRef, s);
      }
      await batch.commit();
    }

    // 5. Check and seed Evaluations
    const evalSnap = await getDocs(collection(db, COLLECTIONS.EVALUATIONS));
    if (evalSnap.empty) {
      console.log('Seeding cloud evaluations collection...');
      const batch = writeBatch(db);
      for (const ev of INITIAL_EVALUATIONS) {
        const evRef = doc(db, COLLECTIONS.EVALUATIONS, ev.id);
        batch.set(evRef, ev);
      }
      await batch.commit();
    }
  } catch (error) {
    console.error('Failed to auto-seed initial cloud data:', error);
  }
}

// -------------------------------------------------------------
// Real-time Subscriptions (onSnapshot)
// -------------------------------------------------------------
export function subscribeToUsers(
  onData: (users: SystemUser[]) => void, 
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: SystemUser[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as SystemUser);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.USERS);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAgreements(
  onData: (agreements: Agreement[]) => void, 
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTIONS.AGREEMENTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Agreement[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as Agreement);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.AGREEMENTS);
      if (onError) onError(err);
    }
  );
}

export function subscribeToExecutions(
  onData: (executions: ExecutionActivity[]) => void, 
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTIONS.EXECUTIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: ExecutionActivity[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as ExecutionActivity);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.EXECUTIONS);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSurveys(
  onData: (surveys: PartnerSurvey[]) => void, 
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTIONS.SURVEYS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: PartnerSurvey[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as PartnerSurvey);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.SURVEYS);
      if (onError) onError(err);
    }
  );
}

export function subscribeToEvaluations(
  onData: (evaluations: PartnerEvaluation[]) => void, 
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, COLLECTIONS.EVALUATIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: PartnerEvaluation[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as PartnerEvaluation);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.EVALUATIONS);
      if (onError) onError(err);
    }
  );
}

// -------------------------------------------------------------
// Online CRUD Mutators (Direct Cloud Writes)
// -------------------------------------------------------------
export async function saveUserToCloud(user: SystemUser) {
  const path = `${COLLECTIONS.USERS}/${user.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserFromCloud(userId: string) {
  const path = `${COLLECTIONS.USERS}/${userId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveAgreementToCloud(agreement: Agreement) {
  const path = `${COLLECTIONS.AGREEMENTS}/${agreement.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.AGREEMENTS, agreement.id), agreement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAgreementFromCloud(agreementId: string) {
  const path = `${COLLECTIONS.AGREEMENTS}/${agreementId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.AGREEMENTS, agreementId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveExecutionToCloud(execution: ExecutionActivity) {
  const path = `${COLLECTIONS.EXECUTIONS}/${execution.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EXECUTIONS, execution.id), execution);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExecutionFromCloud(executionId: string) {
  const path = `${COLLECTIONS.EXECUTIONS}/${executionId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXECUTIONS, executionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSurveyToCloud(survey: PartnerSurvey) {
  const path = `${COLLECTIONS.SURVEYS}/${survey.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.SURVEYS, survey.id), survey);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSurveyFromCloud(surveyId: string) {
  const path = `${COLLECTIONS.SURVEYS}/${surveyId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SURVEYS, surveyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveEvaluationToCloud(evaluation: PartnerEvaluation) {
  const path = `${COLLECTIONS.EVALUATIONS}/${evaluation.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EVALUATIONS, evaluation.id), evaluation);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvaluationFromCloud(evaluationId: string) {
  const path = `${COLLECTIONS.EVALUATIONS}/${evaluationId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVALUATIONS, evaluationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
