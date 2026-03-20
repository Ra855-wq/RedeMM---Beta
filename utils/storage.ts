export const safeStorage = {
  memoryStorage: new Map<string, string>(),

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage is blocked, using memory storage for', key);
      return this.memoryStorage.get(key) || null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage is blocked, using memory storage for', key);
      this.memoryStorage.set(key, value);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      this.memoryStorage.delete(key);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      this.memoryStorage.clear();
    }
  }
};
