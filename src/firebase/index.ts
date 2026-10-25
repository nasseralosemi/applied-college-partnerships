import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Built-in automated Firebase config - zero manual env input needed!
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0883167252",
  appId: "1:48384264797:web:f3f85148efdc530a18dbb4",
  apiKey: "AIzaSyCSV4YV73vR2rufAREGfW1sCi6rogGGPaA",
  authDomain: "gen-lang-client-0883167252.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-aa02ed8f-eb6c-4ea9-8596-bdd16ce71f47",
  storageBucket: "gen-lang-client-0883167252.firebasestorage.app",
  messagingSenderId: "48384264797"
};

// Robust configuration merging: (1) inline defaults, (2) json config, (3) optional env
const firebaseConfig = {
  projectId: 
    rawConfig?.projectId || 
    import.meta.env?.VITE_FIREBASE_PROJECT_ID || 
    DEFAULT_FIREBASE_CONFIG.projectId,
  appId: 
    rawConfig?.appId || 
    import.meta.env?.VITE_FIREBASE_APP_ID || 
    DEFAULT_FIREBASE_CONFIG.appId,
  apiKey: 
    rawConfig?.apiKey || 
    import.meta.env?.VITE_FIREBASE_API_KEY || 
    DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: 
    rawConfig?.authDomain || 
    import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 
    DEFAULT_FIREBASE_CONFIG.authDomain,
  firestoreDatabaseId: 
    rawConfig?.firestoreDatabaseId || 
    import.meta.env?.VITE_FIREBASE_DATABASE_ID || 
    DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
  storageBucket: 
    rawConfig?.storageBucket || 
    import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: 
    rawConfig?.messagingSenderId || 
    import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || 
    DEFAULT_FIREBASE_CONFIG.messagingSenderId
};

// Initialize Firebase App safely (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId (CRITICAL: Required for multi-database instances)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Operation types for error reporting per Firebase skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to server on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
      return false;
    }
    // Document not existing or permission on test is expected, connection itself reached server
    return true;
  }
}

// Run connection test
testConnection();
