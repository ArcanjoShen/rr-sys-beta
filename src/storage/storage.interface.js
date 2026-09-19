/**
 * Storage Interface definition for RR-Sys.
 * This ensures that the application can switch between LocalStorage,
 * an API, or any other storage method without changing business logic.
 */
export class StorageProvider {
  /**
   * Retrieves an item from storage.
   * @param {string} key
   * @returns {Promise<any>}
   */
  async getItem(key) {
    throw new Error("Method 'getItem()' must be implemented.");
  }

  /**
   * Sets an item in storage.
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    throw new Error("Method 'setItem()' must be implemented.");
  }

  /**
   * Removes an item from storage.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    throw new Error("Method 'removeItem()' must be implemented.");
  }

  /**
   * Clears all storage.
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error("Method 'clear()' must be implemented.");
  }
}
