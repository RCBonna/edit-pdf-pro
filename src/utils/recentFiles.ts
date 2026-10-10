export interface RecentFile {
  id: string;
  name: string;
  size: number;
  timestamp: number;
}

const DB_NAME = 'EditPDF_Pro_DB';
const DB_VERSION = 1;
const STORE_NAME = 'recent_files_blobs';
const METADATA_KEY = 'editpdf_pro_recent_metadata';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getRecentFiles = (): RecentFile[] => {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    if (!raw) return [];
    const items: RecentFile[] = JSON.parse(raw);
    return Array.isArray(items) ? items.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch (err) {
    console.error('Failed to read recent files metadata:', err);
    return [];
  }
};

export const saveRecentFile = async (name: string, buffer: ArrayBuffer): Promise<RecentFile[]> => {
  try {
    const size = buffer.byteLength;
    const timestamp = Date.now();
    const id = `recent_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

    // Read current recent files
    let current = getRecentFiles();
    // Remove duplicates with same name if any
    current = current.filter((f) => f.name !== name);

    // Save binary blob to IndexedDB
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(buffer, id);

    const newItem: RecentFile = { id, name, size, timestamp };
    current.unshift(newItem);

    // Keep max 10 recent items
    if (current.length > 10) {
      const toRemove = current.slice(10);
      current = current.slice(0, 10);

      // Clean up IndexedDB blobs for removed items
      const deleteTx = db.transaction(STORE_NAME, 'readwrite');
      const deleteStore = deleteTx.objectStore(STORE_NAME);
      for (const item of toRemove) {
        deleteStore.delete(item.id);
      }
    }

    localStorage.setItem(METADATA_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Failed to save recent file:', err);
    return getRecentFiles();
  }
};

export const loadRecentFileBuffer = async (id: string): Promise<ArrayBuffer | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as ArrayBuffer || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load recent file buffer:', err);
    return null;
  }
};

export const deleteRecentFile = async (id: string): Promise<RecentFile[]> => {
  try {
    let current = getRecentFiles();
    current = current.filter((item) => item.id !== id);
    localStorage.setItem(METADATA_KEY, JSON.stringify(current));

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return current;
  } catch (err) {
    console.error('Failed to delete recent file:', err);
    return getRecentFiles();
  }
};

export const clearRecentFiles = async (): Promise<RecentFile[]> => {
  try {
    localStorage.removeItem(METADATA_KEY);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return [];
  } catch (err) {
    console.error('Failed to clear recent files:', err);
    return [];
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatRecentDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} às ${timeStr}`;
};
