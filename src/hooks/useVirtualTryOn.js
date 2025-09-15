import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HISTORY: '@StyleMe/virtualTryOnHistory',
  PREFERENCES: '@StyleMe/virtualTryOnPreferences',
};

const useVirtualTryOn = () => {
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    preferredProvider: 'AUTO', // Use AUTO to get real AI by default
    autoDetectGarmentType: true,
    saveToHistory: true,
    maxHistoryItems: 20,
    enhanceQuality: true,
    preserveBackground: true,
  });
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, preferencesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
      ]);

      if (historyData) {
        setHistory(JSON.parse(historyData));
      }

      if (preferencesData) {
        setPreferences(prev => ({...prev, ...JSON.parse(preferencesData)}));
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load virtual try-on data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveHistory = useCallback(async (newHistory) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save history:', error);
      }
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save preferences:', error);
      }
    }
  }, []);

  const addToHistory = useCallback((tryOnResult) => {
    if (!preferences.saveToHistory) return;

    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...tryOnResult,
    };

    const newHistory = [historyItem, ...history]
      .slice(0, preferences.maxHistoryItems);
    
    saveHistory(newHistory);
  }, [history, preferences, saveHistory]);

  const removeFromHistory = useCallback((itemId) => {
    const newHistory = history.filter(item => item.id !== itemId);
    saveHistory(newHistory);
  }, [history, saveHistory]);

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  const updatePreferences = useCallback((updates) => {
    const newPreferences = {...preferences, ...updates};
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const getFavorites = useCallback(() => {
    return history.filter(item => item.isFavorite);
  }, [history]);

  const toggleFavorite = useCallback((itemId) => {
    const newHistory = history.map(item =>
      item.id === itemId ? {...item, isFavorite: !item.isFavorite} : item
    );
    saveHistory(newHistory);
  }, [history, saveHistory]);

  const getHistoryByDate = useCallback((date) => {
    const targetDate = new Date(date).toDateString();
    return history.filter(item => 
      new Date(item.timestamp).toDateString() === targetDate
    );
  }, [history]);

  const getRecentHistory = useCallback((limit = 10) => {
    return history.slice(0, limit);
  }, [history]);

  return {
    history,
    preferences,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    updatePreferences,
    getFavorites,
    toggleFavorite,
    getHistoryByDate,
    getRecentHistory,
    refreshData: loadData,
  };
};

export default useVirtualTryOn;