import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import useSubscription from '../hooks/useSubscription';
import useOutfits from '../hooks/useOutfits';
import SubscriptionService from '../services/subscriptionService';
import ToastMessage from '../components/ToastMessage';

const MyPurchasesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isSubscribed, packages, restorePurchases, refreshSubscriptionStatus } = useSubscription();
  const { outfits, refreshOutfits } = useOutfits();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // Calculate current outfit count
  const currentOutfitCount = outfits.length;
  const showToast = (message, type = 'error') => {
    setToastMessage({ message, type });
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const freeOutfitLimit = SubscriptionService.getFreeOutfitLimit();
  const remainingFreeOutfits = Math.max(0, freeOutfitLimit - currentOutfitCount);

  const fetchSubscriptionInfo = async () => {
    try {
      const customerInfo = await SubscriptionService.getCustomerInfo();
      setSubscriptionInfo(customerInfo);
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to fetch subscription info');
      }
    }
  };

  useEffect(() => {
    loadPurchaseHistory();
    fetchSubscriptionInfo();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshOutfits();
      refreshSubscriptionStatus();
      loadPurchaseHistory(); // Refresh purchase history to get updated status
      fetchSubscriptionInfo(); // Refresh subscription info
    }, [refreshOutfits, refreshSubscriptionStatus])
  );

  const loadPurchaseHistory = async () => {
    try {
      setLoading(true);
      const customerInfo = await SubscriptionService.getCustomerInfo();
      if (customerInfo) {
        // Get current subscription status to determine actual status
        const currentSubscriptionStatus = await SubscriptionService.getSubscriptionStatus();

        const history = Object.values(customerInfo.allPurchasedProductIdentifiers || {}).map(productId => ({
          productId,
          status: currentSubscriptionStatus ? 'Active' : 'Expired', // Use actual subscription status
          date: new Date().toLocaleDateString()
        }));
        setPurchaseHistory(history);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to load purchase history');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshSubscriptionStatus(),
      refreshOutfits(),
      loadPurchaseHistory(),
      fetchSubscriptionInfo()
    ]);
    setRefreshing(false);
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.isSubscribed) {
        showToast('Purchases restored successfully!', 'success');
        await fetchSubscriptionInfo(); // Refresh the UI
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

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, you need to manage it through Google Play Store.\n\n' +
      '• Your premium features will remain active until the end of your current billing period\n' +
      '• You can resubscribe anytime\n' +
      '• No charges will occur after cancellation',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Play Store',
          onPress: () => {
            // Open Google Play Store subscription management
            const url = 'https://play.google.com/store/account/subscriptions';
            Linking.openURL(url).catch(() => {
              showToast('Unable to open Google Play Store. Please manually navigate to Play Store > Account > Subscriptions.', 'error');
            });
          },
        },
        {
          text: 'Copy Instructions',
          onPress: () => {
            const instructions = 'To cancel subscription:\n1. Open Google Play Store\n2. Tap your profile icon\n3. Go to Payments & subscriptions\n4. Select Subscriptions\n5. Find StyleMe and tap Cancel';
            // Copy to clipboard would require additional dependency
            Alert.alert('Instructions', instructions, [{text: 'OK'}]);
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    // Navigate to paywall with current outfit count data
    navigation.navigate('Paywall', {
      returnTo: 'My Purchases',
      outfitCount: currentOutfitCount,
      remaining: remainingFreeOutfits
    });
  };

  const renderFreePlan = () => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={styles.planIconContainer}>
          <Icon name="shirt-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>Free Plan</Text>
          <Text style={styles.planSubtitle}>Basic outfit creation</Text>
        </View>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>CURRENT</Text>
        </View>
      </View>

      <View style={styles.planDetails}>
        <View style={styles.usageSection}>
          <Text style={styles.usageTitle}>Outfit Usage</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentOutfitCount / freeOutfitLimit) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentOutfitCount} of {freeOutfitLimit} outfits used
            </Text>
          </View>
          {remainingFreeOutfits > 0 ? (
            <Text style={styles.remainingText}>
              {remainingFreeOutfits} free outfit{remainingFreeOutfits === 1 ? '' : 's'} remaining
            </Text>
          ) : (
            <Text style={styles.limitReachedText}>
              Free limit reached. Upgrade to create more outfits!
            </Text>
          )}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What's Included</Text>
          <View style={styles.feature}>
            <Icon name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Create up to {freeOutfitLimit} outfits</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Basic outfit management</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Icon name="arrow-up-circle" size={20} color={COLORS.textOnPrimary} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPremiumPlan = () => (
    <View style={[styles.planCard, styles.premiumCard]}>
      <View style={styles.planHeader}>
        <View style={[styles.planIconContainer, styles.premiumIconContainer]}>
          <Icon name="diamond" size={24} color={COLORS.warning} />
        </View>
        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, styles.premiumTitle]}>Premium Plan</Text>
          <Text style={styles.planSubtitle}>Unlimited outfit creation</Text>
        </View>
        <View style={[styles.planBadge, isSubscribed ? styles.premiumBadge : styles.expiredBadge]}>
          <Text style={styles.planBadgeText}>{isSubscribed ? 'ACTIVE' : 'EXPIRED'}</Text>
        </View>
      </View>

      <View style={styles.planDetails}>
        <View style={styles.usageSection}>
          <Text style={styles.usageTitle}>Outfit Usage</Text>
          <View style={styles.unlimitedContainer}>
            <Icon name="infinite" size={24} color={COLORS.success} />
            <Text style={styles.unlimitedText}>Unlimited Outfits</Text>
          </View>
          <Text style={styles.currentCountText}>
            You have created {currentOutfitCount} outfit{currentOutfitCount === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Benefits</Text>
          <View style={styles.feature}>
            <Icon name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Unlimited outfit creation</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Virtual try-on feature</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Ad-free experience</Text>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: isSubscribed ? COLORS.success : COLORS.danger }]}>
              {isSubscribed ? 'Active' : 'Expired'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Renewal:</Text>
            <Text style={styles.detailValue}>
              {isSubscribed ? 'Auto-renewing monthly' : 'Subscription ended'}
            </Text>
          </View>
        </View>

        {/* Cancel Subscription Button - Only show if actually subscribed */}
        {isSubscribed && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Icon name="close-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPurchaseHistory = () => {
    if (purchaseHistory.length === 0 && isSubscribed) {
      return null; // Don't show empty history for premium users
    }

    if (purchaseHistory.length === 0) {
      return (
        <View style={styles.emptyHistory}>
          <Icon name="receipt-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyHistoryText}>No purchase history</Text>
          <Text style={styles.emptyHistorySubtext}>
            Your purchases will appear here once you subscribe
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Purchase History</Text>
        {purchaseHistory.map((purchase, index) => (
          <View key={index} style={styles.historyItem}>
            <View>
              <Text style={styles.historyProductId}>Premium Monthly</Text>
              <Text style={styles.historyDate}>{purchase.date}</Text>
            </View>
            <Text style={[styles.historyStatus, {
              color: purchase.status === 'Active' ? COLORS.success : COLORS.danger
            }]}>
              {purchase.status}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 20) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Subscription</Text>
          <Text style={styles.subtitle}>Manage your plan and view usage</Text>
        </View>

        {isSubscribed ? renderPremiumPlan() : renderFreePlan()}
        {renderPurchaseHistory()}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRestorePurchases}
            disabled={loading}
          >
            <Icon name="refresh-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Restore Purchases</Text>
            {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.actionLoader} />}
          </TouchableOpacity>

          {!isSubscribed && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpgrade}
            >
              <Icon name="card-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>View Premium Plans</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  planCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  premiumCard: {
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumIconContainer: {
    backgroundColor: `${COLORS.warning}15`,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  premiumTitle: {
    color: COLORS.warning,
  },
  planSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadge: {
    backgroundColor: COLORS.success,
  },
  expiredBadge: {
    backgroundColor: COLORS.danger,
  },
  planBadgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planDetails: {
    gap: 20,
  },
  usageSection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 20,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
  },
  limitReachedText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '500',
  },
  unlimitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  currentCountText: {
    fontSize: 14,
    color: COLORS.text,
  },
  featuresSection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  subscriptionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyProductId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsSection: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  actionLoader: {
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MyPurchasesScreen;
