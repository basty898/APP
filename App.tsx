import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import OnboardingScreen from './components/OnboardingScreen';
import { User, Subscription } from './types';
import * as db from './db';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize the database on component mount
  useEffect(() => {
    db.initDB().then(() => {
      setIsLoading(false);
    }).catch(error => {
      console.error("Failed to initialize database", error);
      setIsLoading(false);
      // Optionally, show an error message to the user
    });
  }, []);

  const handleAuthSuccess = async (userData: User, isNew: boolean) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsNewUser(isNew);
    if (isNew) {
      setSubscriptions([]);
    } else {
      const userSubscriptions = await db.getSubscriptionsForUser(userData.email);
      setSubscriptions(userSubscriptions);
    }
  };

  const handleOnboardingComplete = async (newSubscriptions: Subscription[]) => {
    if (!user?.email) return;
    for (const sub of newSubscriptions) {
      await db.saveSubscription(sub, user.email);
    }
    setSubscriptions(newSubscriptions);
    setIsNewUser(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsNewUser(false);
    setSubscriptions([]);
  };
  
  // --- Subscription CRUD Operations ---
  
  const addSubscription = async (sub: Subscription) => {
      if(!user?.email) return;
      await db.saveSubscription(sub, user.email);
      setSubscriptions(prev => [...prev, sub]);
  };

  const updateSubscription = async (sub: Subscription) => {
      if(!user?.email) return;
      await db.saveSubscription(sub, user.email);
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
  };
  
  const removeSubscription = async (id: string) => {
      if(!user?.email) return;
      await db.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="bg-app-background font-sans text-text-primary">
         <div className="max-w-md mx-auto bg-app-background min-h-screen flex items-center justify-center">
            <p>Cargando base de datos...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-app-background font-sans text-text-primary">
       <div className="max-w-md mx-auto bg-app-background min-h-screen">
        {isAuthenticated && user ? (
            isNewUser ? (
                <OnboardingScreen onComplete={handleOnboardingComplete} />
            ) : (
                <Dashboard 
                    user={user} 
                    onLogout={handleLogout} 
                    subscriptions={subscriptions}
                    addSubscription={addSubscription}
                    updateSubscription={updateSubscription}
                    removeSubscription={removeSubscription}
                />
            )
        ) : (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
       </div>
    </div>
  );
};

export default App;
