import React, { useState } from 'react';
import { Subscription, Category, Currency, Period, PlanType, SubscriptionStatus } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { format } from 'date-fns';
import { ArrowLeft, Check } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (subscriptions: Omit<Subscription, 'userEmail'>[]) => void;
}

const popularServices = [
  { name: 'Netflix', category: Category.Streaming },
  { name: 'Spotify', category: Category.Music },
  { name: 'YouTube Premium', category: Category.Streaming },
  { name: 'Amazon Prime', category: Category.Streaming },
  { name: 'Disney+', category: Category.Streaming },
  { name: 'HBO Max', category: Category.Streaming },
  { name: 'Gimnasio', category: Category.Sports },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Omit<Subscription, 'userEmail'>[]>([]);
  const [currentSubData, setCurrentSubData] = useState<Partial<Omit<Subscription, 'userEmail'>>>({});
  const [isAdding, setIsAdding] = useState(false);

  const totalSteps = popularServices.length;

  const handleResponse = (hasSubscription: boolean) => {
    if (hasSubscription) {
      const service = popularServices[step];
      setCurrentSubData({
        id: Date.now().toString(),
        platform: service.name,
        category: service.category,
        currency: Currency.CLP,
        period: Period.Monthly,
        renewalDate: new Date(),
        createdAt: new Date(),
        plan: undefined,
        enableReminder: true,
        status: SubscriptionStatus.Active,
      });
      setIsAdding(true);
    } else {
      goToNextStep();
    }
  };

  const goToNextStep = () => {
    setIsAdding(false);
    setCurrentSubData({});
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };
  
  const handleSaveSubscription = (e: React.FormEvent) => {
      e.preventDefault();
      setSubscriptions(prev => [...prev, currentSubData as Omit<Subscription, 'userEmail'>]);
      goToNextStep();
  }

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const isNumericField = ['amount'].includes(name);
      setCurrentSubData(prev => ({ ...prev, [name]: isNumericField ? parseFloat(value) : value }));
  }

   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      const newDate = new Date(value + 'T00:00:00');
      if (!isNaN(newDate.getTime())) {
        setCurrentSubData(prev => ({ ...prev, [name]: newDate }));
      }
    } else {
      setCurrentSubData(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const currentService = step < totalSteps ? popularServices[step] : null;
  const progress = (step / totalSteps) * 100;
  
  if(step >= totalSteps) {
      return (
          <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">
              <div className="w-20 h-20 bg-brand-green text-white rounded-full flex items-center justify-center mb-6">
                <Check size={48} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">¡Todo listo!</h1>
              <p className="text-text-secondary mb-8">Has añadido {subscriptions.length} suscripciones. Ya puedes empezar a gestionar tus gastos.</p>
              <button
                  onClick={() => onComplete(subscriptions)}
                  className="w-full max-w-sm bg-brand-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all text-lg"
              >
                  Ir a mi Panel
              </button>
          </div>
      )
  }

  const categoryStyle = currentService ? CATEGORY_STYLES[currentService.category] : null;
  const Icon = categoryStyle?.icon;

  return (
    <div className="min-h-screen flex flex-col p-5 pt-8">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div className="bg-brand-green h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between items-center text-sm text-text-secondary mb-8">
        <button onClick={() => setStep(s => Math.max(0, s-1))} className="p-2 -ml-2" disabled={step===0}><ArrowLeft /></button>
        <span>Paso {step + 1} de {totalSteps}</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {currentService && categoryStyle && Icon && !isAdding && (
          <>
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${categoryStyle.bgColor} mb-6`}>
              <Icon className={categoryStyle.color} size={52} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">¿Tienes una suscripción a <br/> {currentService.name}?</h2>
            <p className="text-text-secondary mb-8">Ayúdanos a configurar tu cuenta inicial.</p>
            <div className="flex gap-4 w-full max-w-xs">
              <button onClick={() => handleResponse(false)} className="flex-1 py-3 bg-gray-200 text-text-secondary rounded-xl font-semibold hover:bg-gray-300">No</button>
              <button onClick={() => handleResponse(true)} className="flex-1 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-opacity-90">Sí</button>
            </div>
          </>
        )}
        
        {isAdding && (
            <form onSubmit={handleSaveSubscription} className="w-full max-w-sm space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Añadir {currentSubData.platform}</h2>
                <div>
                  <label className="block text-sm font-medium text-left text-gray-700 mb-1">¿Cuánto pagas al mes?</label>
                  <input type="number" name="amount" min="1" onChange={handleDataChange} className="w-full p-3 bg-gray-100 rounded-lg" required placeholder="Ej: 8990" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-left text-gray-700 mb-1">¿Cuál es tu plan?</label>
                   <select name="plan" defaultValue="" onChange={handleDataChange} className="w-full p-3 bg-gray-100 rounded-lg" required>
                      <option value="" disabled>Selecciona un plan</option>
                      {Object.values(PlanType).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-left text-gray-700 mb-1">¿Cuándo contrataste el servicio?</label>
                  <input type="date" name="createdAt" value={currentSubData.createdAt ? format(currentSubData.createdAt, 'yyyy-MM-dd') : ''} onChange={handleDateChange} className="w-full p-3 bg-gray-100 rounded-lg" required />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-left text-gray-700 mb-1">Próxima fecha de pago</label>
                  <input type="date" name="renewalDate" value={currentSubData.renewalDate ? format(currentSubData.renewalDate, 'yyyy-MM-dd') : ''} onChange={handleDateChange} className="w-full p-3 bg-gray-100 rounded-lg" required />
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-brand-green text-white rounded-xl font-semibold hover:bg-opacity-90">Guardar y Continuar</button>
            </form>
        )}
      </div>
      
      <div className="py-4 text-center">
         <button onClick={() => setStep(totalSteps)} className="text-text-secondary font-semibold hover:underline">Omitir por ahora</button>
      </div>

    </div>
  );
};

export default OnboardingScreen;
