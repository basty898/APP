import { createClient } from '@supabase/supabase-js';
import { User, Subscription, UserRole, UserStatus } from './types';

const supabaseUrl = 'https://xiwaqbxypkarqhfrlmfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpd2FxYnh5cGthcnFoZnJsbWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjkwNzQsImV4cCI6MjA3ODU0NTA3NH0.FcgynWZwFBJpjMNMt6vOUxxPFR3sE0AdWpuBbWe8oSY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// initDB is kept for compatibility with App.tsx, but it doesn't need to do anything with Supabase.
export const initDB = (): Promise<void> => {
    return Promise.resolve();
};

// --- User Functions ---

export const addUser = async (user: User & { password?: string }): Promise<void> => {
  const userToSave = { 
    ...user,
    role: user.role || UserRole.User,
    status: user.status || UserStatus.Active,
    createdAt: user.createdAt || new Date(),
  };

  if (userToSave.password) {
    userToSave.password = btoa(userToSave.password);
  }

  const { error } = await supabase.from('users').insert(userToSave);
  if (error) {
    console.error('Supabase addUser error:', error);
    throw error;
  }
};

// This function now returns the full user object including password for auth check
export const getFullUserForAuth = async (email: string): Promise<(User & { password?: string }) | undefined> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "No rows found"
    console.error('Supabase getFullUserForAuth error:', error);
    throw error;
  }
  
  return data ? data : undefined;
};


export const getUser = async (email: string): Promise<User | undefined> => {
  const { data, error } = await supabase
    .from('users')
    .select('firstName, lastName, email, phone, role, status, createdAt, lastLoginAt')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "No rows found"
    console.error('Supabase getUser error:', error);
    throw error;
  }
  
  if (!data) {
    return undefined;
  }

  // Convert date strings to Date objects to match the User type
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
  };
};

export const updateUser = async (user: User, originalEmail: string): Promise<void> => {
    const payload: Partial<User> = { ...user };
    
    const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('email', originalEmail); 
    
    if (error) {
        console.error('Supabase updateUser error:', error);
        throw error;
    }
};

export const updateLastLogin = async (email: string): Promise<void> => {
    const { error } = await supabase
        .from('users')
        .update({ lastLoginAt: new Date() })
        .eq('email', email);
    if (error) {
        console.error('Supabase updateLastLogin error:', error);
        throw error;
    }
}

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('firstName, lastName, email, phone, role, status, createdAt, lastLoginAt');
    if (error) {
        console.error('Supabase getAllUsers error:', error);
        throw error;
    }
    
    return (data || []).map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
    }));
};

export const deleteUser = async (email: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('email', email);
     if (error) {
        console.error('Supabase deleteUser error:', error);
        throw error;
    }
};


// --- Subscription Functions ---

export const saveSubscription = async (subscription: Omit<Subscription, 'userEmail'>, userEmail: string): Promise<void> => {
    const subscriptionWithUser = { ...subscription, userEmail };
    const { error } = await supabase.from('subscriptions').upsert(subscriptionWithUser);
    if (error) {
        console.error('Supabase saveSubscription error:', error);
        throw error;
    }
};

export const getSubscriptionsForUser = async (userEmail: string): Promise<Subscription[]> => {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('userEmail', userEmail);
    if (error) {
        console.error('Supabase getSubscriptionsForUser error:', error);
        throw error;
    }
    return (data || []).map(sub => ({
        ...sub,
        renewalDate: new Date(sub.renewalDate),
        createdAt: sub.createdAt ? new Date(sub.createdAt) : undefined,
        canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : undefined,
    }));
};

export const getAllSubscriptions = async (): Promise<Subscription[]> => {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) {
        console.error('Supabase getAllSubscriptions error:', error);
        throw error;
    }
    return (data || []).map(sub => ({
        ...sub,
        renewalDate: new Date(sub.renewalDate),
        createdAt: sub.createdAt ? new Date(sub.createdAt) : undefined,
        canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : undefined,
    }));
};

export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', subscriptionId);
    if (error) {
        console.error('Supabase deleteSubscription error:', error);
        throw error;
    }
};