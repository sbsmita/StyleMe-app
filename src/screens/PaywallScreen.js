import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../constants/colors';
import useSubscription from '../hooks/useSubscription';
import useOutfits from '../hooks/useOutfits';
import SubscriptionService from '../services/subscriptionService';
import ToastMessage from '../components/ToastMessage';

const PaywallScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {packages, purchasePackage, restorePurchases, refreshSubscriptionStatus} = useSubscription();
  const {outfits} = useOutfits();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const {outfitCount: routeOutfitCount, remaining: routeRemaining, returnTo} = route.params || {};

  // Use real-time outfit count if not provided in route params
  const currentOutfitCount = routeOutfitCount !== undefined ? routeOutfitCount : outfits.length;
  const freeOutfitLimit = SubscriptionService.getFreeOutfitLimit();
  const remainingOutfits = routeRemaining !== undefined ? routeRemaining : Math.max(0, freeOutfitLimit - currentOutfitCount);

  const showToast = (message, type = 'error') => {
    setToastMessage({ message, type });
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const handleGoBack = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (packages.length > 0) {
      // Auto-select monthly package - look for your specific package identifier
      const monthlyPackage = packages.find(pkg =>
        pkg.identifier === 'monthly-plan' ||
        pkg.packageType === 'MONTHLY' ||
        pkg.product.identifier === 'premium:monthly:monthly-plan' ||
        pkg.product.identifier === 'premium_monthly:monthly-plan' ||
        pkg.product.identifier === 'premium_monthly' ||
        pkg.product.identifier.includes('monthly')
      );
      setSelectedPackage(monthlyPackage || packages[0]);
    }
  }, [packages]);

    const handlePurchase = async () => {
    if (!selectedPackage) {
      showToast('Please select a subscription plan', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await purchasePackage(selectedPackage);

      if (result.success) {
        // Refresh subscription status to ensure all components are updated
        await refreshSubscriptionStatus();

        Alert.alert(
          'Welcome to Premium!',
          'Your subscription is now active. Enjoy unlimited outfits!',
          [
            {
              text: 'Continue',
              onPress: handleGoBack,
            },
          ]
        );
      } else if (result.cancelled) {
        // User cancelled, no need to show error
        return;
      } else {
        // Show user-friendly error message via toast
        if (result.notConfigured) {
          showToast('Subscription service is temporarily unavailable. Please try again later.', 'error');
        } else if (result.billingUnavailable) {
          showToast('Payment service is not available. Please make sure you are signed into Google Play Store and try again.', 'error');
        } else {
          showToast('Payment could not be processed. Please check your payment method and try again.', 'error');
        }
      }
    } catch (error) {
      showToast('Unable to process your purchase. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

    const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.isSubscribed) {
        // Refresh subscription status to ensure all components are updated
        await refreshSubscriptionStatus();
        showToast('Purchases restored successfully!', 'success');
        setTimeout(handleGoBack, 2000); // Go back after showing success message
      } else if (result.success) {
        showToast('No active subscriptions found to restore', 'info');
      } else {
        showToast('Unable to restore purchases. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Failed to restore purchases. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price || 'Loading...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleGoBack}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.heroSection}>
          <Icon name="diamond-outline" size={60} color="white" />
          <Text style={styles.heroTitle}>StyleMe Premium</Text>
          <Text style={styles.heroSubtitle}>Unlimited outfit creativity</Text>
        </LinearGradient>

        {/* Limitation Notice */}
        <View style={styles.limitationNotice}>
          <Text style={styles.limitationTitle}>
            {remainingOutfits === 0 ? "You've reached your limit!" : "Upgrade to Premium"}
          </Text>
          <Text style={styles.limitationText}>
            You've created {currentOutfitCount} outfits out of your free limit of {freeOutfitLimit}.
          </Text>
          <Text style={styles.limitationSubtext}>
            {remainingOutfits > 0
              ? `You have ${remainingOutfits} outfit${remainingOutfits === 1 ? '' : 's'} remaining. Upgrade for unlimited access!`
              : 'Upgrade to Premium to create unlimited outfits and unlock all features.'
            }
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Features</Text>

          <View style={styles.feature}>
            <Icon name="infinite-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Unlimited outfit creation</Text>
          </View>

          <View style={styles.feature}>
            <Icon name="camera-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Virtual try-on feature</Text>
          </View>

          <View style={styles.feature}>
            <Icon name="checkmark-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Ad-free experience</Text>
          </View>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          <Text style={styles.packagesTitle}>Choose Your Plan</Text>

          {packages.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageItem,
                selectedPackage?.identifier === pkg.identifier && styles.selectedPackage,
              ]}
              onPress={() => setSelectedPackage(pkg)}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageTitle}>
                  {pkg.product.title || 'Monthly Premium'}
                </Text>
                <Text style={styles.packageDescription}>
                  {pkg.product.description || 'Unlimited outfits & premium features'}
                </Text>
              </View>
              <View style={styles.packagePrice}>
                <Text style={styles.priceText}>
                  {formatPrice(pkg.product.priceString)}
                </Text>
                <Text style={styles.priceSubtext}>/month</Text>
              </View>
              {selectedPackage?.identifier === pkg.identifier && (
                <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={loading || !selectedPackage}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Start Premium - {selectedPackage ? formatPrice(selectedPackage.product.priceString) : ''}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Subscription will auto-renew monthly. Cancel anytime in your account settings.
        </Text>
      </View>

      {/* Toast Message */}
      {toastMessage && (
        <ToastMessage
          message={toastMessage.message}
          type={toastMessage.type}
          onHide={hideToast}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeButton: {
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginTop: 8,
  },
  limitationNotice: {
    backgroundColor: COLORS.card,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  limitationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  limitationSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  featuresSection: {
    margin: 20,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
    flex: 1,
  },
  packagesSection: {
    margin: 20,
  },
  packagesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackage: {
    borderColor: COLORS.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packagePrice: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  priceSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: COLORS.card,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PaywallScreen;
