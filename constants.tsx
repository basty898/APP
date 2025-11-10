
import React from 'react';
import { Subscription, Category, Currency, Period, PaymentMethod } from './types';
import { Tv, Music, Gamepad2, Code, Dumbbell, Newspaper, Package } from 'lucide-react';

export const CATEGORY_STYLES: { [key in Category]: { icon: React.ComponentType<{ className?: string; size?: number }>, color: string, bgColor: string, borderColor: string, chartColor: string } } = {
  [Category.Streaming]: { icon: Tv, color: 'text-brand-purple', bgColor: 'bg-purple-100', borderColor: 'bg-brand-purple', chartColor: '#A487E5' },
  [Category.Music]: { icon: Music, color: 'text-brand-green', bgColor: 'bg-green-100', borderColor: 'bg-brand-green', chartColor: '#24CCA7' },
  [Category.Sports]: { icon: Dumbbell, color: 'text-orange-500', bgColor: 'bg-orange-100', borderColor: 'bg-orange-400', chartColor: '#FF9966' },
  [Category.Software]: { icon: Code, color: 'text-sky-500', bgColor: 'bg-sky-100', borderColor: 'bg-sky-400', chartColor: '#70C4FF' },
  [Category.Gaming]: { icon: Gamepad2, color: 'text-red-500', bgColor: 'bg-red-100', borderColor: 'bg-red-400', chartColor: '#FF6370' },
  [Category.News]: { icon: Newspaper, color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'bg-yellow-400', chartColor: '#FFD166' },
  [Category.Other]: { icon: Package, color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'bg-slate-400', chartColor: '#B0B8C4' },
};

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '2',
    name: 'Spotify Premium',
    category: Category.Music,
    amount: 4500,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-09-28'),
  },
  {
    id: '1',
    name: 'Netflix',
    category: Category.Streaming,
    amount: 8990,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-10-05'),
    paymentMethod: PaymentMethod.Credit,
  },
  {
    id: '3',
    name: 'Gimnasio SmartFit',
    category: Category.Sports,
    amount: 8900,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-10-10'),
    paymentMethod: PaymentMethod.Other,
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    category: Category.Software,
    amount: 45000,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-10-01'),
    notes: 'Plan de todas las aplicaciones.'
  },
];