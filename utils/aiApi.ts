import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

async function getStoredApiKey() {
  // Check localStorage first for performance
  const cached = localStorage.getItem('pmmb_personal_api_key');
  if (cached) return cached;

  // Fallback to Firestore
  if (!auth.currentUser) return null;
  const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (docSnap.exists()) {
    const key = docSnap.data().personal_api_key;
    if (key) {
      localStorage.setItem('pmmb_personal_api_key', key);
      return key;
    }
  }
  return null;
}

export async function aiFetch(url: string, options: any = {}) {
  const apiKey = await getStoredApiKey();
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    (headers as any)['x-api-key'] = apiKey;
  }

  return fetch(url, {
    ...options,
    headers
  });
}
