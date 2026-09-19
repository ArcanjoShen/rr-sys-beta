/**
 * Storage Interface definition for RR-Sys
 * This ensures that the app can switch between LocalStorage and API storage seamlessly.
 */
export class StorageProvider {
  async getItem(key) {
    throw new Error("Method 'getItem()' must be implemented.");
  }
  async setItem(key, value) {
    throw new Error("Method 'setItem()' must be implemented.");
  }
  async removeItem(key) {
    throw new Error("Method 'removeItem()' must be implemented.");
  }
  async clear() {
    throw new Error("Method 'clear()' must be implemented.");
  }
}
