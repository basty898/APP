import React, { useState, useEffect } from 'react';
import { Subscription, Category, Currency, Period, PaymentMethod, PlanType } from '../types';
import { X, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  subscription: Subscription | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSave, onDelete, subscription }) => {
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [error, setError] = useState<string | null>(null);

  const inputStyle = "mt-1 block w-full border-transparent bg-gray-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition";

  useEffect(() => {
    setError(null);
    if (subscription) {
      setFormData({
        ...subscription,
        renewalDate: subscription.renewalDate ? new Date(subscription.renewalDate) : new Date(),
        contractDate: subscription.contractDate ? new Date(subscription.contractDate) : new Date(),
      });
    } else {
      setFormData({
        name: '',
        category: Category.Other,
        amount: undefined,
        currency: Currency.CLP,
        period: Period.Monthly,
        renewalDate: new Date(),
        contractDate: new Date(),
        paymentMethod: undefined,
        notes: '',
        plan: '',
        enableReminder: true,
      });
    }
  }, [subscription, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked }));
        return;
    }

    const isNumericField = ['amount'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumericField ? (value === '' ? undefined : parseFloat(value)) : value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      // The input value is "YYYY-MM-DD"
      const newDate = new Date(value + 'T00:00:00'); // Prevent timezone issues
      if (!isNaN(newDate.getTime())) {
        setFormData(prev => ({ ...prev, [name]: newDate }));
      }
    } else {
      // Handle the case where the input is cleared
      setFormData(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
        setError('El nombre del servicio es obligatorio.');
        return;
    }
    if (formData.amount === undefined || formData.amount < 1) {
        setError('El monto debe ser un número positivo mayor o igual a 1.');
        return;
    }
    setError(null);
    onSave(formData as Subscription);
  };

  const handleDelete = () => {
    if (subscription) {
        onDelete(subscription);
        onClose();
    }
  }
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">{subscription ? 'Editar' : 'Añadir'} Suscripción</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-text-secondary"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputStyle}>
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" name="amount" min="1" value={formData.amount || ''} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className={inputStyle}>
                  {Object.values(Currency).map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodicidad</label>
                <select name="period" value={formData.period} onChange={handleChange} className={inputStyle}>
                  {Object.values(Period).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Contratación</label>
                <input type="date" name="contractDate" value={formData.contractDate ? format(formData.contractDate, 'yyyy-MM-dd') : ''} onChange={handleDateChange} className={inputStyle} required />
              </div>
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Renovación</label>
              <input type="date" name="renewalDate" value={formData.renewalDate ? format(formData.renewalDate, 'yyyy-MM-dd') : ''} onChange={handleDateChange} className={inputStyle} required />
            </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de plan (opcional)</label>
            <select name="plan" value={formData.plan || ''} onChange={handleChange} className={inputStyle}>
              <option value="">Seleccionar plan...</option>
              {Object.values(PlanType).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago (opcional)</label>
            <select name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} className={inputStyle}>
              <option value="">Seleccionar método...</option>
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className={inputStyle}></textarea>
          </div>

          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
            <input 
                type="checkbox" 
                id="enableReminder" 
                name="enableReminder"
                checked={!!formData.enableReminder}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
            />
            <label htmlFor="enableReminder" className="text-sm font-medium text-gray-700">Notificar 3 días antes de la renovación</label>
          </div>

        </form>
        <div className="p-6 bg-gray-50 border-t rounded-b-2xl">
          {error && <p className="text-sm text-brand-red text-center mb-3">{error}</p>}
          <div className="flex justify-between items-center gap-4">
            {subscription && (
                <button
                    onClick={handleDelete}
                    className="p-3 text-brand-red rounded-xl hover:bg-red-100 font-semibold transition"
                    aria-label="Eliminar Suscripción"
                >
                    <Trash2 size={20} />
                </button>
            )}
            <div className="flex-grow flex justify-end gap-3">
                 <button 
                    onClick={onClose} 
                    className="px-6 py-3 bg-gray-200 text-text-secondary rounded-xl hover:bg-gray-300 font-semibold transition"
                >
                    Cancelar
                </button>
                <button 
                  type="submit"
                  onClick={handleSubmit} 
                  className="px-6 py-3 bg-brand-green text-white rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 font-semibold shadow-md"
                >
                  <Save size={18} /> {subscription ? 'Aplicar Cambios' : 'Guardar'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;