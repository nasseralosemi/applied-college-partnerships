import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './index';
import { Agreement, ExecutionActivity, PartnerSurvey, PartnerEvaluation, SystemUser } from '../types';

export const COLLECTIONS = {
  USERS: 'users',
  AGREEMENTS: 'agreements',
  EXECUTIONS: 'executions',
  SURVEYS: 'surveys',
  EVALUATIONS: 'evaluations',
};

// -------------------------------------------------------------
// Seeding is permanently disabled: Firebase Firestore is the sole live source of truth
// -------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  // Permanently disabled: strictly relies on live cloud records without mock injection
  return;
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
      onData(data);
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
      onData(data);
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
      onData(data);
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
      onData(data);
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
      onData(data);
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
