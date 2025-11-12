import React, { useState } from 'react';
import { User } from '../../types';
import { LogOut, Users, BarChart2 } from 'lucide-react';
import UserManagement from './UserManagement';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'users';

const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-brand-green/20 text-brand-green' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
        <Icon className="mr-3" size={20} />
        <span>{label}</span>
    </button>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <AnalyticsDashboard />;
            case 'users':
                return <UserManagement />;
            default:
                return <AnalyticsDashboard />;
        }
    }
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-20 flex items-center justify-center border-b border-gray-700">
                    <h1 className="text-xl font-bold">ZenSub Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={BarChart2} label="Gráficos" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavItem icon={Users} label="Gestión de Usuarios" isActive={activeView === 'users'} onClick={() => setActiveView('users')} />
                </nav>
                <div className="p-4 border-t border-gray-700">
                     <div className="mb-4">
                        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <LogOut className="mr-3" size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-app-background">
                    <div className="p-8">
                      {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;