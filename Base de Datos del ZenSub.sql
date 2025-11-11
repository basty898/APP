import { User, Subscription } from './types';

const DB_NAME = 'ZenSubDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const SUBS_STORE = 'subscriptions';

let db: IDBDatabase;

// --- DB Initialization ---

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = (event.target as IDBOpenDBRequest).result;
      
      // Create users store
      if (!tempDb.objectStoreNames.contains(USERS_STORE)) {
        tempDb.createObjectStore(USERS_STORE, { keyPath: 'email' });
      }

      // Create subscriptions store
      if (!tempDb.objectStoreNames.contains(SUBS_STORE)) {
        const subsStore = tempDb.createObjectStore(SUBS_STORE, { keyPath: 'id' });
        // Create an index to query subscriptions by user email
        subsStore.createIndex('userEmailIndex', 'userEmail', { unique: false });
      }
    };
  });
};


// --- Helper for Transactions ---

const performTransaction = <T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    action: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = action(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
    });
};


// --- User Operations ---

interface StoredUser extends User {
    password?: string;
}

export const addUser = (user: StoredUser): Promise<IDBValidKey> => {
    return performTransaction<IDBValidKey>(USERS_STORE, 'readwrite', store => store.add(user));
}

export const getUser = async (email: string): Promise<StoredUser | undefined> => {
    const user = await performTransaction<StoredUser>(USERS_STORE, 'readonly', store => store.get(email.toLowerCase()));
    return user;
};


// --- Subscription Operations ---

interface StoredSubscription extends Subscription {
    userEmail: string;
}

export const saveSubscription = (subscription: Subscription, userEmail: string): Promise<IDBValidKey> => {
    const storedSub: StoredSubscription = { ...subscription, userEmail: userEmail.toLowerCase() };
    return performTransaction<IDBValidKey>(SUBS_STORE, 'readwrite', store => store.put(storedSub));
};

export const getSubscriptionsForUser = (userEmail: string): Promise<Subscription[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(SUBS_STORE, 'readonly');
        const store = transaction.objectStore(SUBS_STORE);
        const index = store.index('userEmailIndex');
        const request = index.getAll(userEmail.toLowerCase());

        request.onsuccess = () => {
             // Convert dates from string back to Date objects
            const subsWithDates = request.result.map((sub: any) => ({
                ...sub,
                renewalDate: new Date(sub.renewalDate),
                contractDate: sub.contractDate ? new Date(sub.contractDate) : undefined,
            }));
            resolve(subsWithDates);
        };
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
    });
};

export const deleteSubscription = (subscriptionId: string): Promise<void> => {
    return performTransaction<void>(SUBS_STORE, 'readwrite', store => store.delete(subscriptionId));
};
