// Discovery attempts stay local and are isolated per signed-in account.
export function createProgressStore(userId?: string) {
  const key = userId ? `yaka-progress-v1:${userId}` : 'yaka-progress-v1';
  const eventName = `yaka-progress:${key}`;
  let memory: string | null = null;
  let loaded = false;
  return {
    subscribe(callback: () => void) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) {
          memory = event.newValue;
          callback();
        }
      };
      window.addEventListener('storage', onStorage);
      window.addEventListener(eventName, callback);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener(eventName, callback);
      };
    },
    getSnapshot() {
      if (!loaded) {
        try {
          memory = localStorage.getItem(key);
        } catch {
          /* Keep the in-memory store. */
        }
        loaded = true;
      }
      return memory;
    },
    getServerSnapshot() {
      return null;
    },
    save(value: unknown) {
      memory = JSON.stringify(value);
      let persisted = true;
      try {
        localStorage.setItem(key, memory);
      } catch {
        persisted = false;
      }
      window.dispatchEvent(new Event(eventName));
      return persisted;
    },
  };
}
