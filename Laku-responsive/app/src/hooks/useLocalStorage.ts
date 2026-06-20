import { useCallback, useState } from 'react';
import { readStorage, writeStorage } from '@/services/storage/storage';

/** State yang otomatis tersinkron ke localStorage. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStorage<T>(key, initial));
  const set = useCallback((next: T) => {
    setValue(next);
    writeStorage(key, next);
  }, [key]);
  return [value, set] as const;
}
