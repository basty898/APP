
import React, { useState, useMemo } from 'react';
import { Subscription, Category, User } from '../types';
import { MOCK_SUBSCRIPTIONS, CATEGORY_STYLES } from '../constants';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionModal from './SubscriptionModal';
import CategoryChart from './CategoryChart';
import BottomNav from './BottomNav';
import ProfileScreen from './ProfileScreen';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type View = 'dashboard' | 'subscriptions' | 'profile';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [activeView, setActiveView] = useState<View>('dashboard');

    const handleAddSubscription = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEditSubscription = (sub: Subscription) => {
        setEditingSubscription(sub);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!subscriptionToDelete) return;
        setSubscriptions(subs => subs.filter(s => s.id !== subscriptionToDelete.id));
        setSubscriptionToDelete(null);
    };

    const handleSaveSubscription = (sub: Subscription) => {
        if (editingSubscription) {
            setSubscriptions(subs => subs.map(s => s.id === sub.id ? sub : s));
        } else {
            setSubscriptions(subs => [...subs, { ...sub, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setEditingSubscription(null);
    };

    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(sub => selectedCategory ? sub.category === selectedCategory : true)
            .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
    }, [subscriptions, searchTerm, selectedCategory]);

    const totalMonthlyCost = useMemo(() => {
        return subscriptions.reduce((total, sub) => {
            const monthlyAmount = sub.period === 'Anual' ? sub.amount / 12 : sub.amount;
            if (sub.currency === 'CLP') {
                return total + monthlyAmount;
            }
            return total;
        }, 0);
    }, [subscriptions]);
    
    const upcomingRenewal = useMemo(() => {
        const today = new Date();
        return subscriptions.filter(s => s.renewalDate >= today).sort((a,b) => a.renewalDate.getTime() - b.renewalDate.getTime())[0];
    }, [subscriptions]);

    const chartData = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        subscriptions.forEach(sub => {
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
    }, [subscriptions]);

    const chartColors = useMemo(() => chartData.map(entry => {
        const categoryKey = entry.name as keyof typeof CATEGORY_STYLES;
        const colorClass = CATEGORY_STYLES[categoryKey].color;
        const colorMap: { [key: string]: string } = {
            'brand-red': '#EF4444', 'brand-green': '#10B981', 'brand-blue': '#3B82F6',
            'brand-purple': '#8B5CF6', 'brand-orange': '#F97316', 'brand-yellow': '#EAB308', 'brand-gray': '#6B7280'
        };
        return colorMap[colorClass] || '#000000';
      }), [chartData]);

    return (
        <div className="min-h-screen flex flex-col relative">
            <main className="flex-grow overflow-y-auto p-5 pb-32">
                 {activeView === 'profile' ? (
                    <ProfileScreen user={user} onLogout={onLogout} />
                ) : (
                    <>
                        <header className="mb-6">
                            <h1 className="text-3xl font-bold text-text-primary">Hola, {user.firstName}!</h1>
                            <p className="text-text-secondary">Bienvenido de vuelta.</p>
                        </header>
                
                        {activeView === 'dashboard' && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-accent-blue-light p-4 rounded-2xl">
                                        <p className="text-sm text-text-secondary">Total Mensual:</p>
                                        <p className="text-2xl font-bold text-text-primary">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalMonthlyCost)}</p>
                                    </div>
                                    <div className="bg-accent-orange-light p-4 rounded-2xl">
                                        <p className="text-sm text-text-secondary">Próxima Renovación:</p>
                                        {upcomingRenewal ? (
                                            <p className="text-lg font-bold text-text-primary">{upcomingRenewal.name} <span className="text-base font-medium">{format(upcomingRenewal.renewalDate, 'dd MMM', {locale: es})}</span></p>
                                        ) : (
                                            <p className="text-lg font-bold text-text-primary">-</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-card p-4 rounded-2xl shadow-sm mb-6">
                                    <h3 className="text-lg font-semibold text-text-primary mb-2">Gastos por Categoría</h3>
                                    <div className="flex items-center gap-4 h-32">
                                        <div className="w-1/2 h-full">
                                        <CategoryChart data={chartData} colors={chartColors} />
                                        </div>
                                        <div className="w-1/2 space-y-1 text-xs">
                                        {chartData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[index] }} />
                                            <span className="text-text-secondary truncate">{entry.name}</span>
                                            <span className="font-bold text-text-primary ml-auto">{`${(entry.percent * 100).toFixed(0)}%`}</span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <h2 className="text-xl font-bold text-text-primary mb-4">
                            {activeView === 'dashboard' ? 'Próximas Renovaciones' : 'Todas las Suscripciones'}
                        </h2>
                        
                        <div className="flex overflow-x-auto space-x-3 mb-4 pb-2 -mx-5 px-5">
                            {Object.values(Category).map(cat => {
                                const Icon = CATEGORY_STYLES[cat].icon;
                                const isSelected = selectedCategory === cat;
                                return (
                                    <button key={cat} onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
                                        className={`flex-shrink-0 flex items-center gap-2 p-2 px-3 rounded-full text-sm transition-colors ${isSelected ? 'bg-text-primary text-white' : 'bg-card'}`}>
                                        <Icon size={16} />
                                        <span>{cat}</span>
                                    </button>
                                )
                            })}
                        </div>


                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-none bg-card rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            />
                        </div>

                        <div className="space-y-4">
                            {filteredSubscriptions.length > 0 ? filteredSubscriptions.map(sub => (
                                <SubscriptionCard 
                                    key={sub.id} 
                                    subscription={sub} 
                                    onEdit={() => handleEditSubscription(sub)} 
                                    onDelete={() => setSubscriptionToDelete(sub)}
                                />
                            )) : <p className="text-center text-text-secondary mt-8">No se encontraron suscripciones.</p>}
                        </div>
                    </>
                )}
            </main>

            <BottomNav activeView={activeView} setActiveView={setActiveView} onAddClick={handleAddSubscription} />
            
            {isModalOpen && (
                <SubscriptionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubscription}
                    subscription={editingSubscription}
                />
            )}

            {subscriptionToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Eliminación</h3>
                        <p className="text-text-secondary mb-6">
                            ¿Estás seguro de que quieres eliminar la suscripción a <span className="font-bold">{subscriptionToDelete.name}</span>? Esta acción no se puede deshacer.
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
