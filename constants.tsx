import React from 'react';
import { Subscription, Category, Currency, Period, PaymentMethod } from './types';
import { Tv, Music, Gamepad2, Code, Dumbbell, Newspaper, Package, Headphones } from 'lucide-react';

// Fix: Updated icon type to accept size prop, which fixes type errors in Dashboard.tsx and SubscriptionCard.tsx.
export const CATEGORY_STYLES: { [key in Category]: { icon: React.ComponentType<{ className?: string; size?: number }>, gradient: string, color: string } } = {
  [Category.Streaming]: { icon: Tv, gradient: 'from-blue-400 to-cyan-400', color: 'brand-blue' },
  [Category.Music]: { icon: Music, gradient: 'from-green-400 to-emerald-400', color: 'brand-green' },
  [Category.Sports]: { icon: Dumbbell, gradient: 'from-orange-400 to-amber-500', color: 'brand-orange' },
  [Category.Software]: { icon: Code, gradient: 'from-purple-400 to-indigo-500', color: 'brand-purple' },
  [Category.Gaming]: { icon: Gamepad2, gradient: 'from-red-400 to-rose-500', color: 'brand-red' },
  [Category.News]: { icon: Newspaper, gradient: 'from-yellow-400 to-amber-500', color: 'brand-yellow' },
  [Category.Other]: { icon: Package, gradient: 'from-gray-400 to-slate-500', color: 'brand-gray' },
};

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    category: Category.Streaming,
    amount: 8990,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-09-28'),
    paymentMethod: PaymentMethod.Credit,
  },
  {
    id: '2',
    name: 'Spotify Familia',
    category: Category.Music,
    amount: 4500,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-09-30'),
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
  {
    id: '5',
    name: 'Xbox Game Pass',
    category: Category.Gaming,
    amount: 7990,
    currency: Currency.CLP,
    period: Period.Monthly,
    renewalDate: new Date('2024-09-25'),
  },
];