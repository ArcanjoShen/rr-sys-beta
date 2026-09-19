import { StorageProvider } from './storage.interface.js';

/**
 * LocalStorage implementation of StorageProvider.
 * Handles serialization and deserialization of JSON data automatically.
 */
export class LocalStorageProvider extends StorageProvider {
  async getItem(key) {
    const value = localStorage.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, it's likely a plain string
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
