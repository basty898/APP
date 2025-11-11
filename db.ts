import { User, Subscription } from './types';

const DB_NAME = 'ZenSubDB';
const DB_VERSION = 1;
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
      // User store: key is email
      if (!dbInstance.objectStoreNames.contains(USER_STORE)) {
        dbInstance.createObjectStore(USER_STORE, { keyPath: 'email' });
      }
      // Subscriptions store: key is id, with an index on userEmail for lookups
      if (!dbInstance.objectStoreNames.contains(SUBS_STORE)) {
        const subsStore = dbInstance.createObjectStore(SUBS_STORE, { keyPath: 'id' });
        subsStore.createIndex('userEmail', 'userEmail', { unique: false });
      }
    };
  });
};

// --- User Functions ---

export const addUser = (user: User & { password?: string }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.add(user);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getUser = (email: string): Promise<(User & { password?: string }) | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const request = store.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Subscription Functions ---

export const saveSubscription = (subscription: Subscription, userEmail: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // We need to store the user's email with the subscription to link them
      const subscriptionWithUser = { ...subscription, userEmail };

      const transaction = db.transaction(SUBS_STORE, 'readwrite');
      const store = transaction.objectStore(SUBS_STORE);
      // 'put' works for both adding and updating
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
        // IndexedDB may store dates as strings, so we need to convert them back to Date objects
        if (!request.result) {
            resolve([]);
            return;
        }
        const subs = request.result.map(sub => ({
          ...sub,
          renewalDate: new Date(sub.renewalDate),
          contractDate: sub.contractDate ? new Date(sub.contractDate) : undefined,
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
