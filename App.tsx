
import React, { useState, useEffect } from 'react';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eyeRest, setEyeRest] = useState(false);

  useEffect(() => {
    if (eyeRest) {
      document.body.classList.add('descanso-visao');
    } else {
      document.body.classList.remove('descanso-visao');
    }
  }, [eyeRest]);

  return (
    <div className="antialiased min-h-screen">
      {isLoggedIn ? (
        <DashboardView 
          onLogout={() => setIsLoggedIn(false)} 
          eyeRest={eyeRest} 
          setEyeRest={setEyeRest} 
        />
      ) : (
        <LoginView onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;
