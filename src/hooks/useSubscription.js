import {useState, useEffect, useCallback} from 'react';
import SubscriptionService from '../services/subscriptionService';

const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);

  const checkSubscriptionStatus = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const subscribed = await SubscriptionService.getSubscriptionStatus(forceRefresh);
      setIsSubscribed(subscribed);
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to check subscription status');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPackages = useCallback(async () => {
    try {
      const availablePackages = await SubscriptionService.getAvailablePackages();
      setPackages(availablePackages);
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to load packages');
      }
    }
  }, []);

  useEffect(() => {
    checkSubscriptionStatus(false); // Initial load doesn't need force refresh
    loadPackages();
  }, [checkSubscriptionStatus, loadPackages]); // Now we can safely include these stable functions

  const purchasePackage = useCallback(async (packageToPurchase) => {
    const result = await SubscriptionService.purchasePackage(packageToPurchase);
    if (result.success) {
      setIsSubscribed(result.isSubscribed);
    }
    return result;
  }, []);

  const restorePurchases = useCallback(async () => {
    const result = await SubscriptionService.restorePurchases();
    if (result.success) {
      setIsSubscribed(result.isSubscribed);
    }
    return result;
  }, []);

  const canCreateOutfit = useCallback(async (currentOutfitCount) => {
    return await SubscriptionService.canCreateOutfit(currentOutfitCount);
  }, []);

  const refreshSubscriptionStatus = useCallback(async (forceRefresh = true) => {
    return await checkSubscriptionStatus(forceRefresh); // Force refresh when explicitly requested
  }, [checkSubscriptionStatus]);

  return {
    isSubscribed,
    loading,
    packages,
    checkSubscriptionStatus,
    refreshSubscriptionStatus,
    purchasePackage,
    restorePurchases,
    canCreateOutfit,
  };
};

export default useSubscription;
