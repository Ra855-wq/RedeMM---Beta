
import React, { useState, useEffect } from 'react';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [eyeRest, setEyeRest] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('redemm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (eyeRest) {
      document.body.classList.add('descanso-visao');
    } else {
      document.body.classList.remove('descanso-visao');
    }
  }, [eyeRest]);

  const handleLogout = () => {
    localStorage.removeItem('redemm_user');
    setUser(null);
  };

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
          const savedUser = localStorage.getItem('redemm_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }} />
      )}
    </div>
  );
};

export default App;
