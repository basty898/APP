import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import OnboardingScreen from './components/OnboardingScreen';
import AdminPanel from './components/admin/AdminPanel';
import { User, Subscription, UserRole } from './types';
import * as db from './db';

const AppSkeleton: React.FC = () => (
    <div className="max-w-md mx-auto bg-app-background min-h-screen flex flex-col p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div className="h-5 w-24 bg-gray-300 rounded"></div>
        </div>
        <div className="h-8 w-48 bg-gray-300 rounded mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
        <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded-2xl"></div>
            <div className="h-16 bg-gray-200 rounded-2xl"></div>
        </div>
    </div>
);


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize the database on component mount
  useEffect(() => {
    db.initDB().then(() => {
      // Simulate a small delay for a smoother loading experience
      setTimeout(() => setIsLoading(false), 500);
    }).catch(error => {
      console.error("Failed to initialize database", error);
      setIsLoading(false);
    });
  }, []);

  const handleAuthSuccess = async (userData: User, isNew: boolean) => {
    try {
      const fullUser = await db.getUser(userData.email);
      if (!fullUser) {
        throw new Error("User data could not be retrieved after authentication.");
      };
      
      // Update last login time in a separate, secure operation
      await db.updateLastLogin(fullUser.email);

      setUser(fullUser);
      setIsAuthenticated(true);
      setIsNewUser(isNew);

      if (isNew) {
        setSubscriptions([]);
      } else {
        const userSubscriptions = await db.getSubscriptionsForUser(fullUser.email);
        setSubscriptions(userSubscriptions);
      }
    } catch (error) {
      console.error("Failed during post-authentication process:", error);
      handleLogout(); // Reset to a clean state
      // Re-throw the error to be caught by the AuthScreen's handler
      throw error;
    }
  };

  const handleOnboardingComplete = async (newSubscriptions: Omit<Subscription, 'userEmail'>[]) => {
    if (!user?.email) return;
    const subsToSave = [];
    for (const sub of newSubscriptions) {
      await db.saveSubscription(sub, user.email);
      subsToSave.push({ ...sub, userEmail: user.email });
    }
    setSubscriptions(subsToSave);
    setIsNewUser(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsNewUser(false);
    setSubscriptions([]);
  };
  
  // --- Subscription CRUD Operations ---
  
  const addSubscription = async (sub: Omit<Subscription, 'userEmail'>) => {
      if(!user?.email) return;
      await db.saveSubscription(sub, user.email);
      setSubscriptions(prev => [...prev, { ...sub, userEmail: user!.email }]);
  };

  const updateSubscription = async (sub: Omit<Subscription, 'userEmail'>) => {
      if(!user?.email) return;
      await db.saveSubscription(sub, user.email);
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...sub, userEmail: user!.email } : s));
  };
  
  const removeSubscription = async (id: string) => {
      if(!user?.email) return;
      await db.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const updateUserProfile = async (updatedUser: User) => {
    if (!user) throw new Error("No user is currently logged in.");
    const originalEmail = user.email;

    if (updatedUser.email !== originalEmail) {
        const existing = await db.getUser(updatedUser.email);
        if (existing) {
            throw new Error('El correo electrónico ya está en uso.');
        }
    }
    
    await db.updateUser(updatedUser, originalEmail);
    
    setUser({ ...updatedUser });
  };

  const renderContent = () => {
    if (isLoading) {
      return <AppSkeleton />;
    }

    if (!isAuthenticated || !user) {
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    if (user.role === UserRole.Admin) {
      return <AdminPanel user={user} onLogout={handleLogout} />;
    }

    // Regular User Flow
    if (isNewUser) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    return (
      <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          subscriptions={subscriptions}
          addSubscription={addSubscription}
          updateSubscription={updateSubscription}
          removeSubscription={removeSubscription}
          updateUserProfile={updateUserProfile}
      />
    );
  };

  return (
    <div className="bg-app-background font-sans text-text-primary">
       <div className={user?.role === UserRole.Admin ? "w-full" : "max-w-md mx-auto bg-app-background min-h-screen"}>
        {renderContent()}
       </div>
    </div>
  );
};

export default App;