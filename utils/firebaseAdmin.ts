
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../firebase-applet-config.json'), 'utf8')
);

const MOCK_ADMIN = { id: 'mock-admin', username: 'admin', password: '123', role: 'admin', status: 'active', name: 'Admin Mock' };
const MOCK_USERS = [MOCK_ADMIN];

let mockDb = {
  collection: (name: string) => ({
    where: (field: string, op: string, val: string) => ({
      where: (f2: string, o2: string, v2: string) => ({
        limit: () => ({
          get: async () => {
             const user = MOCK_USERS.find(u => u[field] === val && u[f2] === v2);
             return { empty: !user, docs: user ? [{ id: user.id, data: () => user }] : [] };
          }
        })
      }),
      limit: () => ({
        get: async () => {
          const user = MOCK_USERS.find(u => u[field] === val);
          return { empty: !user, docs: user ? [{ id: user.id, data: () => user }] : [] };
        }
      })
    }),
    limit: () => ({
      get: async () => ({ empty: false, docs: MOCK_USERS.map(u => ({ id: u.id, data: () => u })) })
    }),
    get: async () => ({ empty: false, docs: MOCK_USERS.map(u => ({ id: u.id, data: () => u })) }),
    add: async (data: any) => { 
      const newUser = { id: Math.random().toString(), ...data };
      MOCK_USERS.push(newUser);
      return { id: newUser.id }; 
    },
    doc: (id: string) => ({
      update: async (data: any) => {
        const idx = MOCK_USERS.findIndex(u => u.id === id);
        if (idx !== -1) MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
      },
      delete: async () => {
        const idx = MOCK_USERS.findIndex(u => u.id === id);
        if (idx !== -1) MOCK_USERS.splice(idx, 1);
      },
      get: async () => {
        const user = MOCK_USERS.find(u => u.id === id);
        return { id: user?.id, data: () => user };
      }
    })
  })
};

let db: any;
let auth: any;

export function getFirebaseAdmin() {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountEnv) {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT ausente. Utilizando Mock DB para testes locais e evitar erro 5 NOT_FOUND.");
    return { db: mockDb, auth: { createCustomToken: async () => "mock-token" } };
  }

  let app;
  if (!getApps().length) {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccountEnv)),
      projectId: firebaseConfig.projectId,
    });
  } else {
    app = getApp();
  }
  
  if (!db) {
    if (firebaseConfig.firestoreDatabaseId) {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
  }

  if (!auth) {
    auth = getAuth(app);
  }
  
  return { db, auth };
}

