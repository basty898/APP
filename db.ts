import { User, Subscription, UserRole, UserStatus, SignupRecord } from './types';

// =================================================================================
// BASE DE DATOS LOCAL CON LOCALSTORAGE
// =================================================================================
// La aplicación utiliza el almacenamiento local del navegador para persistir los datos.
// No se requiere una base de datos externa ni configuración de API.
// =================================================================================


const USERS_KEY = 'zensub_users';
const SUBSCRIPTIONS_KEY = 'zensub_subscriptions';
const SIGNUPS_KEY = 'zensub_signups';

// --- Funciones de Utilidad ---

const getUsersFromStorage = (): (User & { password?: string })[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data).map((u: any) => ({
      ...u,
      createdAt: new Date(u.createdAt),
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
    })) : [];
};

const getSubscriptionsFromStorage = (): Subscription[] => {
    const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return data ? JSON.parse(data).map((s: any) => ({
      ...s,
      renewalDate: new Date(s.renewalDate),
      createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
      canceledAt: s.canceledAt ? new Date(s.canceledAt) : undefined,
    })) : [];
};

const getSignupsFromStorage = (): any[] => {
    const data = localStorage.getItem(SIGNUPS_KEY);
    return data ? JSON.parse(data) : [];
}

// --- API de la Base de Datos ---

export const initDB = (): void => {
    // Initialize storage if keys don't exist
    if (localStorage.getItem(USERS_KEY) === null) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
    if (localStorage.getItem(SUBSCRIPTIONS_KEY) === null) {
        localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify([]));
    }
    if (localStorage.getItem(SIGNUPS_KEY) === null) {
        localStorage.setItem(SIGNUPS_KEY, JSON.stringify([]));
    }

    // Ensure the admin user always exists
    const users = getUsersFromStorage();
    const adminExists = users.some(u => u.email === 'admin@zensub.cl');

    if (!adminExists) {
        const adminUser = {
            firstName: 'Admin',
            lastName: 'Zen',
            email: 'admin@zensub.cl',
            password: btoa('admin'), // Inseguro, solo para demo
            role: UserRole.Admin,
            status: UserStatus.Active,
            createdAt: new Date(),
        };
        users.push(adminUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

export const addUser = async (user: User & { password?: string }): Promise<void> => {
    const users = getUsersFromStorage();
    if (users.find(u => u.email === user.email.toLowerCase())) {
        throw new Error('Este correo electrónico ya está registrado.');
    }
    const newUser = {
        ...user,
        email: user.email.toLowerCase(),
        password: user.password ? btoa(user.password) : undefined,
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getFullUserForAuth = async (email: string): Promise<(User & { password?: string }) | undefined> => {
    const users = getUsersFromStorage();
    return users.find(u => u.email === email.toLowerCase());
};


export const getUser = async (email: string): Promise<User | undefined> => {
    const users = getUsersFromStorage();
    const foundUser = users.find(u => u.email === email.toLowerCase());
    if (foundUser) {
        const { password, ...userToReturn } = foundUser;
        return userToReturn;
    }
    return undefined;
};

export const updateUser = async (user: User, originalEmail: string): Promise<void> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.email === originalEmail.toLowerCase());
    if (userIndex !== -1) {
        const currentUserData = users[userIndex];
        users[userIndex] = { ...currentUserData, ...user };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
        throw new Error('Usuario no encontrado para actualizar.');
    }
};

export const updateLastLogin = async (email: string): Promise<void> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    if (userIndex !== -1) {
        users[userIndex].lastLoginAt = new Date();
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};


export const getAllUsers = async (): Promise<User[]> => {
    const users = getUsersFromStorage();
    return users.map(({ password, ...user }) => user);
};


export const deleteUser = async (email: string): Promise<void> => {
    let users = getUsersFromStorage();
    users = users.filter(u => u.email !== email.toLowerCase());
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    let subscriptions = getSubscriptionsFromStorage();
    subscriptions = subscriptions.filter(s => s.userEmail !== email.toLowerCase());
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

export const saveSubscription = async (subscription: Omit<Subscription, 'userEmail'>, userEmail: string): Promise<void> => {
    let subscriptions = getSubscriptionsFromStorage();
    const index = subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
        subscriptions[index] = { ...subscription, userEmail };
    } else {
        subscriptions.push({ ...subscription, userEmail });
    }
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

export const getSubscriptionsForUser = async (userEmail: string): Promise<Subscription[]> => {
    const subscriptions = getSubscriptionsFromStorage();
    return subscriptions.filter(s => s.userEmail === userEmail.toLowerCase());
};

export const getAllSubscriptions = async (): Promise<Subscription[]> => {
    return getSubscriptionsFromStorage();
};

export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
    let subscriptions = getSubscriptionsFromStorage();
    subscriptions = subscriptions.filter(s => s.id !== subscriptionId);
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

export const recordSignup = async (userEmail: string): Promise<void> => {
    const signups = getSignupsFromStorage();
    const users = getUsersFromStorage();
    const user = users.find(u => u.email === userEmail.toLowerCase());
    if (user) {
        signups.push({ 
            signup_date: new Date(),
            users: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            }
        });
        localStorage.setItem(SIGNUPS_KEY, JSON.stringify(signups));
    }
};

export const getNewSignups = async (): Promise<SignupRecord[]> => {
    const signups = getSignupsFromStorage();
     return signups.map((s: any) => ({
      ...s,
      signup_date: new Date(s.signup_date),
    }));
};