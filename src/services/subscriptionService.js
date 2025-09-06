import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_STORAGE_KEY = '@StyleMe_subscription';
const FREE_OUTFIT_LIMIT = 2;

class SubscriptionService {
  static async initializePurchases() {
    try {
      // RevenueCat API keys - IMPORTANT: Use your production key for release builds
      const apiKey = __DEV__
        ? 'goog_JIsOEoVGIgVjhYcNLViUxChAuuW'  // Development key
        : 'goog_JIsOEoVGIgVjhYcNLViUxChAuuW';  // TODO: Replace with your PRODUCTION key before release!
      await Purchases.configure({apiKey});

      if (__DEV__) {
        console.log('RevenueCat initialized successfully');
      }

      // Check if billing is available
      const customerInfo = await Purchases.getCustomerInfo();
      if (__DEV__) {
        console.log('Billing is available, customer info:', customerInfo.originalAppUserId);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('RevenueCat initialization failed - billing may not be available');
      }
    }
  }

  static async getSubscriptionStatus(forceRefresh = false) {
    try {
      // If force refresh is requested, skip cache
      if (!forceRefresh) {
        // Check cache first for quick access
        try {
          const storedStatus = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
          if (storedStatus) {
            const {isSubscribed, lastChecked} = JSON.parse(storedStatus);
            // Use cache if it's less than 5 minutes old
            if (Date.now() - lastChecked < 5 * 60 * 1000) {
              return isSubscribed || false;
            }
          }
        } catch (cacheError) {
          if (__DEV__) {
            console.log('Failed to read cached subscription status');
          }
        }
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const isSubscribed = customerInfo.entitlements.active['Premium access'] !== undefined;

      // Store subscription status locally for quick access
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
        isSubscribed,
        lastChecked: Date.now()
      }));

      return isSubscribed;
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to get subscription status, using cached data');
      }

      // Fallback to local storage if network fails
      try {
        const storedStatus = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
        if (storedStatus) {
          const {isSubscribed} = JSON.parse(storedStatus);
          return isSubscribed || false;
        }
      } catch (storageError) {
        if (__DEV__) {
          console.log('Failed to read cached subscription status');
        }
      }

      return false;
    }
  }

  static async getAvailablePackages() {
    try {
      if (__DEV__) {
        console.log('Fetching offerings from RevenueCat...');
      }
      const offerings = await Purchases.getOfferings();

      if (__DEV__) {
        console.log('Offerings response:', {
          current: offerings.current?.identifier,
          all: Object.keys(offerings.all),
          hasCurrentOffering: !!offerings.current,
          currentPackageCount: offerings.current?.availablePackages?.length || 0
        });
      }

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        if (__DEV__) {
          console.log('=== DETAILED PACKAGE DEBUG ===');
          offerings.current.availablePackages.forEach((pkg, index) => {
            console.log(`Package ${index + 1} Details:`, {
              identifier: pkg.identifier,
              productId: pkg.product.identifier,
              title: pkg.product.title,
              price: pkg.product.priceString,
              currencyCode: pkg.product.currencyCode,
              subscriptionPeriod: pkg.product.subscriptionPeriod,
              introPrice: pkg.product.introPrice,
              periodType: pkg.product.productType,
              periodUnit: pkg.product.subscriptionPeriod?.unit,
              periodNumberOfUnits: pkg.product.subscriptionPeriod?.numberOfUnits,
              description: pkg.product.description
            });
          });
          console.log('=== END PACKAGE DEBUG ===');
        }
        return offerings.current.availablePackages;
      }

      if (__DEV__) {
        console.log('No packages found in current offering');
        console.log('All offerings:', Object.keys(offerings.all));
        if (Object.keys(offerings.all).length > 0) {
          console.log('First available offering:', offerings.all[Object.keys(offerings.all)[0]]);
        }
      }
      return [];
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to get available packages:', error.message);
        console.log('Error details:', error);
      }
      return [];
    }
  }

  static async purchasePackage(packageToPurchase) {
    try {
      if (__DEV__) {
        console.log('Attempting to purchase package:', packageToPurchase.identifier);
        console.log('Package details:', {
          productId: packageToPurchase.product.identifier,
          title: packageToPurchase.product.title,
          price: packageToPurchase.product.priceString
        });
      }

      const {customerInfo} = await Purchases.purchasePackage(packageToPurchase);
      const isSubscribed = customerInfo.entitlements.active['Premium access'] !== undefined;

      // Update local storage
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
        isSubscribed,
        lastChecked: Date.now()
      }));

      return {success: true, isSubscribed};
    } catch (error) {
      // Log only minimal info, don't expose detailed errors to console
      if (__DEV__) {
        console.log('Purchase attempt failed');
      }

      if (error.userCancelled) {
        return {success: false, cancelled: true};
      }

      // Handle billing configuration errors
      if (error.message.includes('not configured for billing') ||
          error.message.includes('APPLICATION_UNAVAILABLE') ||
          error.code === 'STOREFRONT_NOT_AVAILABLE') {
        return {
          success: false,
          error: 'App not configured for billing. Please install from Google Play Store or add your account to license testing.',
          notConfigured: true
        };
      }

      // Handle billing unavailable error specifically
      if (error.message.includes('billing') || error.message.includes('BILLING') || error.code === 'SERVICE_UNAVAILABLE') {
        return {
          success: false,
          error: 'Billing service is not available. Please make sure you are signed into Google Play Store and try again.',
          billingUnavailable: true
        };
      }

      return {success: false, error: error.message};
    }
  }

  static async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isSubscribed = customerInfo.entitlements.active['Premium access'] !== undefined;

      // Update local storage
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
        isSubscribed,
        lastChecked: Date.now()
      }));

      return {success: true, isSubscribed};
    } catch (error) {
      if (__DEV__) {
        console.log('Restore purchases failed');
      }
      return {success: false, error: error.message};
    }
  }

  static async canCreateOutfit(currentOutfitCount) {
    const isSubscribed = await this.getSubscriptionStatus();

    if (isSubscribed) {
      return {canCreate: true, isSubscribed: true};
    }

    // For free users, check if they can still create outfits
    const canCreate = currentOutfitCount < FREE_OUTFIT_LIMIT;
    return {
      canCreate,
      isSubscribed: false,
      remaining: Math.max(0, FREE_OUTFIT_LIMIT - currentOutfitCount),
      limit: FREE_OUTFIT_LIMIT
    };
  }

  static getFreeOutfitLimit() {
    return FREE_OUTFIT_LIMIT;
  }

  static async getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to get customer info');
      }
      return null;
    }
  }
}

export default SubscriptionService;
