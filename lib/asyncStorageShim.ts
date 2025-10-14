// Minimal no-op AsyncStorage shim for web builds.
// Provides the same async API surface used by some libraries but performs no persistence.

type Value = string | null;

const memoryStore = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string): Promise<Value> {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
  },
  async clear(): Promise<void> {
    memoryStore.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return Array.from(memoryStore.keys());
  },
  async multiGet(keys: string[]): Promise<[string, Value][]> {
    return keys.map((k) => [k, memoryStore.has(k) ? memoryStore.get(k)! : null]);
  },
  async multiSet(entries: [string, string][]): Promise<void> {
    for (const [k, v] of entries) memoryStore.set(k, v);
  },
  async multiRemove(keys: string[]): Promise<void> {
    for (const k of keys) memoryStore.delete(k);
  },
};

export default AsyncStorage;


