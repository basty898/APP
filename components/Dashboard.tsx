import React, { useState, useMemo } from 'react';
import { Subscription, User, SubscriptionStatus } from '../types';
import { CATEGORY_STYLES } from '../constants';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionModal from './SubscriptionModal';
import CategoryChart from './CategoryChart';
import BottomNav from './BottomNav';
import ProfileScreen from './ProfileScreen';
import NotificationsScreen from './NotificationsScreen';
import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

type View = 'dashboard' | 'subscriptions' | 'notifications' | 'profile';
type StatusFilter = 'all' | SubscriptionStatus.Active | SubscriptionStatus.Canceled;

const ZenSubLogo = () => (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green to-blue-400 flex items-center justify-center">
             <div className="w-5 h-5 rounded-full bg-app-background/80"></div>
        </div>
        <span className="font-bold text-xl text-text-primary">ZenSub</span>
    </div>
);

interface DashboardProps {
    user: User;
    onLogout: () => void;
    subscriptions: Subscription[];
    addSubscription: (sub: Omit<Subscription, 'userEmail'>) => Promise<void>;
    updateSubscription: (sub: Omit<Subscription, 'userEmail'>) => Promise<void>;
    removeSubscription: (id: string) => Promise<void>;
    updateUserProfile: (user: User) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, subscriptions, addSubscription, updateSubscription, removeSubscription, updateUserProfile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const handleAddSubscription = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEditSubscription = (sub: Subscription) => {
        setEditingSubscription(sub);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!subscriptionToDelete) return;
        await removeSubscription(subscriptionToDelete.id);
        setSubscriptionToDelete(null);
    };

    const handleSaveSubscription = async (sub: Omit<Subscription, 'userEmail'>) => {
        if (editingSubscription) {
            await updateSubscription(sub);
        } else {
            const newSub = { ...sub, id: Date.now().toString() };
            await addSubscription(newSub);
        }
        setIsModalOpen(false);
        setEditingSubscription(null);
    };

    const activeSubscriptions = useMemo(() => {
        return subscriptions.filter(s => s.status === SubscriptionStatus.Active);
    }, [subscriptions]);

    const filteredAndSortedSubscriptions = useMemo(() => {
         return subscriptions
            .filter(sub => {
                const searchMatch = sub.platform.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === 'all' || sub.status === statusFilter;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
    }, [subscriptions, searchTerm, statusFilter]);

    const totalMonthlyCost = useMemo(() => {
        return activeSubscriptions.reduce((total, sub) => {
            const monthlyAmount = sub.period === 'Anual' ? sub.amount / 12 : sub.amount;
            if (sub.currency === 'CLP') {
                return total + monthlyAmount;
            }
            return total;
        }, 0);
    }, [activeSubscriptions]);
    
    const upcomingRenewal = useMemo(() => {
        const today = new Date();
        return [...activeSubscriptions]
            .sort((a,b) => a.renewalDate.getTime() - b.renewalDate.getTime())
            .find(s => s.renewalDate >= today);
    }, [activeSubscriptions]);

    const chartData = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        activeSubscriptions.forEach(sub => {
            const monthlyAmount = sub.period === 'Anual' ? sub.amount / 12 : sub.amount;
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyAmount;
        });
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        if (total === 0) return [];
        return Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
            percent: value / total
        }));
    }, [activeSubscriptions]);

    const chartColors = useMemo(() => chartData.map(entry => {
        const categoryKey = entry.name as keyof typeof CATEGORY_STYLES;
        return CATEGORY_STYLES[categoryKey].chartColor || '#000000';
      }), [chartData]);
      
    const renderContent = () => {
        if (activeView === 'profile') {
            return <ProfileScreen user={user} onLogout={onLogout} onUpdateUser={updateUserProfile} />;
        }

        if (activeView === 'notifications') {
            return <NotificationsScreen subscriptions={subscriptions} />;
        }
        
        if (activeView === 'subscriptions') {
            return (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-text-primary">Servicios</h2>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        {(['all', SubscriptionStatus.Active, SubscriptionStatus.Canceled] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${statusFilter === status ? 'bg-brand-green text-white font-semibold' : 'bg-white text-text-secondary hover:bg-gray-100'}`}
                            >
                                {status === 'all' ? 'Todas' : status}
                            </button>
                        ))}
                    </div>

                    {filteredAndSortedSubscriptions.length > 0 ? filteredAndSortedSubscriptions.map(sub => (
                        <SubscriptionCard 
                            key={sub.id} 
                            subscription={sub} 
                            onClick={() => handleEditSubscription(sub)}
                        />
                    )) : <div className="text-center text-text-secondary pt-12">
                            <p className="mb-4">No se encontraron suscripciones con esos criterios.</p>
                             {subscriptions.length === 0 && <button
                                onClick={handleAddSubscription}
                                className="bg-brand-green text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all"
                            >
                                Añadir mi primera suscripción
                            </button>}
                        </div>
                    }
                </div>
            )
        }

        return (
            <>
                <p className="text-lg text-text-secondary mb-6">Hola, {user.firstName}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card p-4 rounded-2xl shadow-sm shadow-shadow-light">
                        <p className="text-sm text-text-secondary mb-1">Tu Gasto Mensual Total:</p>
                        <div className="w-8 h-0.5 bg-brand-green rounded-full mb-2"></div>
                        <p className="text-2xl font-bold text-text-primary">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalMonthlyCost)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-2xl shadow-sm shadow-shadow-light">
                        <p className="text-sm text-text-secondary mb-2">Próximas Renovaciones:</p>
                        {upcomingRenewal ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-purple flex-shrink-0"></div>
                                <p className="text-sm font-semibold text-text-primary truncate">{upcomingRenewal.platform} - {format(upcomingRenewal.renewalDate, 'dd MMM', {locale: es})}</p>
                             </div>
                        ) : (
                            <p className="text-sm font-semibold text-text-secondary">-</p>
                        )}
                    </div>
                </div>

                <div className="bg-card p-4 rounded-2xl shadow-sm shadow-shadow-light mb-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-text-primary">Flujo de Gastos por Categoría</h3>
                        <div className="w-16 h-0.5 bg-gray-200 rounded-full mt-2 mb-1 mx-auto"></div>
                    </div>
                    <div className="h-48">
                       <CategoryChart data={chartData} colors={chartColors} />
                    </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Suscripciones Activas</h2>
                </div>
                 <div className="space-y-3">
                    {activeSubscriptions.length > 0 ? activeSubscriptions.slice(0, 3).map(sub => (
                        <SubscriptionCard 
                            key={sub.id} 
                            subscription={sub} 
                        />
                    )) : <p className="text-center text-text-secondary mt-4">Aquí verás tus suscripciones activas.</p>}
                </div>
            </>
        )
    }

    return (
        <div className="min-h-screen flex flex-col relative pb-32">
             <header className="flex justify-start items-center p-5 pt-8">
                <ZenSubLogo />
            </header>
            
            <main className="flex-grow overflow-y-auto px-5">
                 {renderContent()}
            </main>

             {activeView === 'subscriptions' && subscriptions.length > 0 && (
                <button
                    onClick={handleAddSubscription}
                    className="fixed bottom-28 right-8 w-16 h-16 bg-brand-green text-white rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-20"
                    aria-label="Añadir Suscripción"
                >
                    <Plus size={32} />
                </button>
            )}
            
            <BottomNav activeView={activeView} setActiveView={setActiveView} />
            
            {isModalOpen && (
                <SubscriptionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubscription}
                    onDelete={(sub) => setSubscriptionToDelete(sub)}
                    subscription={editingSubscription}
                />
            )}

            {subscriptionToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Eliminación</h3>
                        <p className="text-text-secondary mb-6">
                            ¿Estás seguro de que quieres eliminar la suscripción a <span className="font-bold">{subscriptionToDelete.platform}</span>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setSubscriptionToDelete(null)} 
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-brand-red text-white rounded-md hover:bg-red-600 font-semibold"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
