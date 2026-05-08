/**
 * useLocalStorage Hook
 * Custom React hook for persistent state with localStorage
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'pfm_';

/**
 * Get prefixed storage key
 * @param {string} key - Storage key
 * @returns {string} Prefixed key
 */
const getKey = (key) => `${STORAGE_PREFIX}${key}`;

/**
 * Custom hook for localStorage state persistence
 * @param {string} key - Storage key
 * @param {any} initialValue - Default value if not in storage
 * @returns {[any, Function]} State and setter
 */
export const useLocalStorage = (key, initialValue) => {
  const storageKey = getKey(key);

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${storageKey}":`, error);
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider clearing old data.');
      }
    }
  }, [storageKey, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${storageKey}":`, error);
    }
  }, [storageKey, initialValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors from other tabs
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return [storedValue, setValue, removeValue];
};

/**
 * Get all stored data (for export/backup)
 * @returns {Object} All stored data
 */
export const getAllStoredData = () => {
  const data = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const shortKey = key.replace(STORAGE_PREFIX, '');
        try {
          data[shortKey] = JSON.parse(window.localStorage.getItem(key));
        } catch {
          data[shortKey] = window.localStorage.getItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error reading all stored data:', error);
  }
  return data;
};

/**
 * Import all stored data (for restore)
 * @param {Object} data - Data to restore
 */
export const setAllStoredData = (data) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      window.localStorage.setItem(getKey(key), JSON.stringify(value));
    });
  } catch (error) {
    console.error('Error setting all stored data:', error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllStoredData = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all stored data:', error);
  }
};

/**
 * Export all data as JSON string
 * @returns {string} JSON string of all data
 */
export const exportAllData = () => {
  return JSON.stringify(getAllStoredData(), null, 2);
};

/**
 * Import data from JSON string
 * @param {string} jsonString - JSON data string
 * @returns {boolean} Success status
 */
export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format');
    }
    setAllStoredData(data);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Check localStorage availability
 * @returns {boolean} Whether localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export default useLocalStorage;
