import { useState, useEffect, useMemo } from 'react';
import { User, Subscription, SubscriptionStatus, UserStatus } from '../types';
import * as db from '../db';

export const useAnalytics = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [allUsers, allSubs] = await Promise.all([
                db.getAllUsers(),
                db.getAllSubscriptions()
            ]);
            setUsers(allUsers);
            setSubscriptions(allSubs);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const kpis = useMemo(() => {
        const activeUsers = users.filter(u => u.status === UserStatus.Active).length;
        const activeSubs = subscriptions.filter(s => s.status === SubscriptionStatus.Active);
        
        const activeSubscriptions = activeSubs.length;

        // Calculate average monthly value from all active subscriptions
        let averageMonthlyValue = 0;
        if (activeSubscriptions > 0) {
            const totalMonthlyValue = activeSubs.reduce((sum, sub) => {
                const monthlyAmount = sub.period === 'Anual' ? sub.amount / 12 : sub.amount;
                return sum + monthlyAmount;
            }, 0);
            averageMonthlyValue = totalMonthlyValue / activeSubscriptions;
        }
        
        // Calculate all-time churn rate
        const canceledSubsCount = subscriptions.filter(s => s.status === SubscriptionStatus.Canceled).length;
        const totalSubsForChurn = activeSubscriptions + canceledSubsCount;
        const churnRate = totalSubsForChurn > 0 ? (canceledSubsCount / totalSubsForChurn) * 100 : 0;

        return { activeUsers, activeSubscriptions, averageMonthlyValue, churnRate };
    }, [users, subscriptions]);

    const platformData = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === SubscriptionStatus.Active);
        const platformTotals: { [key: string]: number } = {};
        
        activeSubs.forEach(sub => {
            platformTotals[sub.platform] = (platformTotals[sub.platform] || 0) + 1;
        });
        
        const total = activeSubs.length;
        if (total === 0) return [];
        
        return Object.entries(platformTotals)
            .map(([name, value]) => ({ name, value, percent: value / total }))
            .sort((a,b) => b.value - a.value);

    }, [subscriptions]);

    const categoryData = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === SubscriptionStatus.Active);
        const categoryTotals: { [key: string]: number } = {};

        activeSubs.forEach(sub => {
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + 1;
        });

        const total = activeSubs.length;
        if (total === 0) return [];

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value, percent: value / total }))
            .sort((a,b) => b.value - a.value);
    }, [subscriptions]);


    return {
        isLoading,
        kpis,
        platformData,
        categoryData,
    };
};