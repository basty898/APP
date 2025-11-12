import { User, Subscription, UserRole, UserStatus } from './types';

const DB_NAME = 'ZenSubDB';
const DB_VERSION = 2; // Incremented version
const USER_STORE = 'users';
const SUBS_STORE = 'subscriptions';

let db: IDBDatabase;

// Function to initialize the database
export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
        return resolve();
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      // User store: key is email
      if (oldVersion < 1) {
        if (!dbInstance.objectStoreNames.contains(USER_STORE)) {
            dbInstance.createObjectStore(USER_STORE, { keyPath: 'email' });
        }
        // Subscriptions store: key is id, with an index on userEmail for lookups
        if (!dbInstance.objectStoreNames.contains(SUBS_STORE)) {
            const subsStore = dbInstance.createObjectStore(SUBS_STORE, { keyPath: 'id' });
            subsStore.createIndex('userEmail', 'userEmail', { unique: false });
        }
      }

      if (oldVersion < 2) {
        // Seed Admin User
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if(transaction) {
            const userStore = transaction.objectStore(USER_STORE);
            const adminUser = {
                email: 'admin@zensub.cl',
                password: 'admin',
                firstName: 'Admin',
                lastName: 'Zensub',
                role: UserRole.Admin,
                status: UserStatus.Active,
                createdAt: new Date(),
            };
            userStore.add(adminUser);
        }
      }
    };
  });
};

// --- User Functions ---

export const addUser = (user: User & { password?: string }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.add({
        ...user,
        role: user.role || UserRole.User,
        status: user.status || UserStatus.Active,
        createdAt: user.createdAt || new Date(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getUser = (email: string): Promise<(User & { password?: string }) | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const request = store.get(email.toLowerCase());

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateUser = (user: User & { password?: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(USER_STORE, 'readwrite');
        const store = transaction.objectStore(USER_STORE);
        const request = store.put(user);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAllUsers = (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(USER_STORE, 'readonly');
        const store = transaction.objectStore(USER_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteUser = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE, SUBS_STORE], 'readwrite');
        const userStore = transaction.objectStore(USER_STORE);
        const subsStore = transaction.objectStore(SUBS_STORE);
        const subsIndex = subsStore.index('userEmail');

        // Delete user
        const userDeleteRequest = userStore.delete(email);
        userDeleteRequest.onerror = () => reject(userDeleteRequest.error);

        // Delete associated subscriptions
        const subsRequest = subsIndex.openCursor(IDBKeyRange.only(email));
        subsRequest.onsuccess = () => {
            const cursor = subsRequest.result;
            if (cursor) {
                subsStore.delete(cursor.primaryKey);
                cursor.continue();
            }
        };
        subsRequest.onerror = () => reject(subsRequest.error);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};


// --- Subscription Functions ---

export const saveSubscription = (subscription: Omit<Subscription, 'userEmail'>, userEmail: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const subscriptionWithUser = { ...subscription, userEmail };

      const transaction = db.transaction(SUBS_STORE, 'readwrite');
      const store = transaction.objectStore(SUBS_STORE);
      const request = store.put(subscriptionWithUser);
  
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
};

export const getSubscriptionsForUser = (userEmail: string): Promise<Subscription[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SUBS_STORE, 'readonly');
      const store = transaction.objectStore(SUBS_STORE);
      const index = store.index('userEmail');
      const request = index.getAll(userEmail);

      request.onsuccess = () => {
        if (!request.result) {
            resolve([]);
            return;
        }
        const subs: Subscription[] = request.result.map((sub: any) => ({
          ...sub,
          renewalDate: new Date(sub.renewalDate),
          createdAt: sub.createdAt ? new Date(sub.createdAt) : undefined,
          canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : undefined,
        }));
        resolve(subs);
      };
      request.onerror = () => reject(request.error);
    });
};

export const getAllSubscriptions = (): Promise<Subscription[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SUBS_STORE, 'readonly');
      const store = transaction.objectStore(SUBS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
         if (!request.result) {
            resolve([]);
            return;
        }
        const subs: Subscription[] = request.result.map((sub: any) => ({
          ...sub,
          renewalDate: new Date(sub.renewalDate),
          createdAt: sub.createdAt ? new Date(sub.createdAt) : undefined,
          canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : undefined,
        }));
        resolve(subs);
      };
      request.onerror = () => reject(request.error);
    });
};


export const deleteSubscription = (subscriptionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SUBS_STORE, 'readwrite');
      const store = transaction.objectStore(SUBS_STORE);
      const request = store.delete(subscriptionId);
  
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
};