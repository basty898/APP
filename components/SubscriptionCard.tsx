
import React, { useState, useRef, useEffect } from 'react';
import { Subscription } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit, onDelete }) => {
  const { name, category, amount, currency, renewalDate, period } = subscription;
  const categoryStyle = CATEGORY_STYLES[category];
  const Icon = categoryStyle.icon;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setIsMenuOpen(false);
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsMenuOpen(false);
  }

  return (
    <div 
      onClick={onEdit}
      className={`bg-gradient-to-br ${categoryStyle.gradient} rounded-2xl p-4 text-white shadow-lg cursor-pointer transition-transform hover:scale-105 relative`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl">
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm opacity-80">{new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)} / {period}</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
            <button onClick={handleMenuClick} className="p-2 -mr-2 -mt-2 opacity-70 hover:opacity-100 rounded-full hover:bg-white/20">
                <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
                <div className="absolute top-10 right-0 bg-white rounded-lg shadow-xl py-1 z-20 w-36">
                    <button onClick={handleEditClick} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100">
                        <Pencil size={14}/> Editar
                    </button>
                    <button onClick={handleDeleteClick} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-red-50">
                        <Trash2 size={14}/> Borrar
                    </button>
                </div>
            )}
        </div>
      </div>
      <div className="text-right mt-2">
        <p className="text-sm font-semibold opacity-90">Renovación: {format(renewalDate, 'dd MMM, yyyy', { locale: es })}</p>
      </div>
    </div>
  );
};

export default SubscriptionCard;
