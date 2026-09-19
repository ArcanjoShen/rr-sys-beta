import { StorageProvider } from './storage.interface.js';

/**
 * LocalStorage implementation of StorageProvider
 */
export class LocalStorageProvider extends StorageProvider {
  async getItem(key) {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return value;
    }
  }

  async setItem(key, value) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }

  async removeItem(key) {
    localStorage.removeItem(key);
  }

  async clear() {
    localStorage.clear();
  }
}
