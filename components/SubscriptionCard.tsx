
import React from 'react';
import { Subscription } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { format } from 'date-fns';
// FIX: The locale must be imported from its specific path.
import { es } from 'date-fns/locale/es';

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onClick }) => {
  const { name, category, amount, currency, renewalDate, plan } = subscription;
  const categoryStyle = CATEGORY_STYLES[category];
  const Icon = categoryStyle.icon;

  return (
    <div 
      onClick={onClick}
      className={`bg-card rounded-2xl p-3 pr-4 shadow-sm shadow-shadow-light relative flex items-center gap-3 overflow-hidden ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
    >
      <div className={`absolute top-0 right-0 h-full w-2 ${categoryStyle.borderColor}`}></div>
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${categoryStyle.bgColor}`}>
          <Icon className={categoryStyle.color} size={24} />
      </div>
      <div className="flex-grow overflow-hidden">
          <h3 className="font-bold text-md text-text-primary truncate">{name}</h3>
          <p className="text-sm text-text-secondary">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)}
              {plan && <span className="text-xs"> - {plan}</span>}
          </p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
          <p className="font-semibold text-md text-text-primary">
              {format(renewalDate, 'dd', { locale: es })}
          </p>
          <p className="text-sm text-text-secondary -mt-1">
              {format(renewalDate, 'MMM', { locale: es })}
          </p>
      </div>
    </div>
  );
};

export default SubscriptionCard;
