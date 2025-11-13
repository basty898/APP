import React from 'react';
import { LayoutDashboard, WalletCards, User, Bell } from 'lucide-react';

type View = 'dashboard' | 'subscriptions' | 'notifications' | 'profile';

interface BottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

interface NavItemProps {
    icon: React.ComponentType<{ size?: number, className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 text-text-secondary w-20 transition-colors hover:text-text-primary">
    <Icon size={24} className={active ? 'text-brand-green' : ''} />
    <span className={`text-xs font-medium ${active ? 'font-bold text-brand-green' : ''}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30">
        <div className="bg-white/70 backdrop-blur-lg border-t border-gray-100/80 rounded-t-3xl shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-24">
                <NavItem icon={LayoutDashboard} label="Inicio" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavItem icon={WalletCards} label="Servicios" active={activeView === 'subscriptions'} onClick={() => setActiveView('subscriptions')} />
                <NavItem icon={Bell} label="Notificaciones" active={activeView === 'notifications'} onClick={() => setActiveView('notifications')} />
                <NavItem icon={User} label="Perfil" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
            </div>
        </div>
    </div>
  );
};

export default BottomNav;
