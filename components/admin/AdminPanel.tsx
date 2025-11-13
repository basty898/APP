import React, { useState } from 'react';
import { User } from '../../types';
import { LayoutDashboard, Users, UserPlus, LogOut, Building } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';
import NewUserSignups from './NewUserSignups';

type AdminView = 'analytics' | 'users' | 'signups';

interface AdminPanelProps {
    user: User;
    onLogout: () => void;
}

const NavItem: React.FC<{ icon: React.ElementType, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            active
                ? 'bg-brand-green text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        <Icon className="mr-3" size={20} />
        <span>{label}</span>
    </button>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState<AdminView>('analytics');

    const renderContent = () => {
        switch (activeView) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'users':
                return <UserManagement />;
            case 'signups':
                return <NewUserSignups />;
            default:
                return <AnalyticsDashboard />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-lg flex flex-col p-4">
                <div className="flex items-center gap-2 p-4 border-b mb-6">
                    <Building className="text-brand-green" size={28}/>
                    <span className="font-bold text-xl text-text-primary">Admin Panel</span>
                </div>
                <nav className="flex-grow space-y-2">
                    <NavItem icon={LayoutDashboard} label="Analíticas" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
                    <NavItem icon={Users} label="Gestión de Usuarios" active={activeView === 'users'} onClick={() => setActiveView('users')} />
                    <NavItem icon={UserPlus} label="Nuevos Registros" active={activeView === 'signups'} onClick={() => setActiveView('signups')} />
                </nav>
                <div className="mt-auto">
                     <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="mr-3" size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                 <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary capitalize">{activeView === 'signups' ? 'Nuevos Registros' : activeView}</h1>
                    <div className="text-right">
                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPanel;
