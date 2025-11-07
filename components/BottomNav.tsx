import React from 'react';
import { LayoutDashboard, WalletCards, User, Plus } from 'lucide-react';

type View = 'dashboard' | 'subscriptions' | 'profile';

interface BottomNavProps {
    onAddClick: () => void;
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
    <Icon size={24} className={active ? 'text-brand-purple' : ''} />
    <span className={`text-xs font-medium ${active ? 'font-bold text-brand-purple' : ''}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ onAddClick, activeView, setActiveView }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100/80 rounded-t-3xl shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <div className="flex justify-around items-center h-24">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <NavItem icon={WalletCards} label="Suscripciones" active={activeView === 'subscriptions'} onClick={() => setActiveView('subscriptions')} />
            <button
                onClick={onAddClick}
                className="w-16 h-16 bg-gradient-to-br from-brand-green to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-8 transition-transform hover:scale-110"
                aria-label="Añadir Suscripción"
            >
                <Plus size={32} />
            </button>
            <div className="w-20"></div> {/* Spacer for the right side NavItem */}
            <NavItem icon={User} label="Perfil" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
        </div>
    </div>
  );
};

export default BottomNav;