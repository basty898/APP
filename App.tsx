
import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="bg-background font-sans text-text-primary">
       <div className="max-w-md mx-auto bg-background">
        {isAuthenticated && user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}
       </div>
    </div>
  );
};

export default App;
