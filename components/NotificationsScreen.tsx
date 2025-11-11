
import React from 'react';
import { Subscription } from '../types';
import { Bell } from 'lucide-react';
import { differenceInDays, isFuture, parseISO, format } from 'date-fns';
import SubscriptionCard from './SubscriptionCard';
import { es } from 'date-fns/locale/es';


interface NotificationsScreenProps {
  subscriptions: Subscription[];
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ subscriptions }) => {

  const today = new Date();

  const upcomingRenewals = subscriptions.filter(sub => {
    if (!sub.enableReminder || !isFuture(sub.renewalDate)) {
        return false;
    }
    const daysUntilRenewal = differenceInDays(sub.renewalDate, today);
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 3;
  }).sort((a,b) => a.renewalDate.getTime() - b.renewalDate.getTime());

  return (
    <div className="p-4">
      <header className="text-center mb-8">
        <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <Bell className="text-brand-purple" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Notificaciones</h1>
        <p className="text-text-secondary">Aquí verás tus próximos recordatorios de pago.</p>
      </header>

      {upcomingRenewals.length > 0 ? (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Renovaciones en los próximos 3 días:</h2>
            {upcomingRenewals.map(sub => (
                <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-300">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-text-primary">{sub.name}</p>
                            <p className="text-sm text-text-secondary">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: sub.currency, maximumFractionDigits: 0 }).format(sub.amount)}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-orange-500">{format(sub.renewalDate, 'dd MMM', {locale: es})}</p>
                           <p className="text-xs text-orange-400">
                           {
                                differenceInDays(sub.renewalDate, today) === 0 ? 'Hoy' :
                                `En ${differenceInDays(sub.renewalDate, today)} día(s)`
                           }
                           </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center text-text-secondary mt-12">
            <p>No tienes renovaciones en los próximos 3 días.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
