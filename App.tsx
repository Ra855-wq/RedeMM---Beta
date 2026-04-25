
import React, { useState, useEffect } from 'react';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { User } from './types';
import { safeStorage } from './utils/storage';
import { auth, db } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [eyeRest, setEyeRest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userSnap.exists()) {
            const userData = { id: firebaseUser.uid, ...userSnap.data() } as User;
            if (userData.status === 'active') {
              setUser(userData);
              safeStorage.setItem('redemm_user', JSON.stringify(userData));
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.error("Auth sync error", err);
        }
      } else {
        const savedUser = safeStorage.getItem('redemm_user');
        if (!savedUser) setUser(null);
      }
      setLoading(false);
    });

    const savedUser = safeStorage.getItem('redemm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (eyeRest) {
      document.body.classList.add('descanso-visao');
    } else {
      document.body.classList.remove('descanso-visao');
    }
  }, [eyeRest]);

  const handleLogout = () => {
    auth.signOut();
    safeStorage.removeItem('redemm_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-600/30 border-t-accent-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="antialiased min-h-screen">
      {user ? (
        <DashboardView 
          user={user}
          onLogout={handleLogout} 
          eyeRest={eyeRest} 
          setEyeRest={setEyeRest} 
        />
      ) : (
        <LoginView onLogin={() => {
          const savedUser = safeStorage.getItem('redemm_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }} />
      )}
    </div>
  );
};

export default App;
