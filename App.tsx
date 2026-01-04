import React, { useState } from 'react';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';

const App: React.FC = () => {
  // Simple state-based routing/auth simulation
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="antialiased text-slate-900 bg-slate-50 min-h-screen">
      {isLoggedIn ? (
        <DashboardView onLogout={handleLogout} />
      ) : (
        <LoginView onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
