import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import {COLORS} from '../constants/colors';
import OutfitCard from '../components/OutfitCard';
import OutfitViewer from '../components/OutfitViewer';
import useOutfits from '../hooks/useOutfits';
import useSubscription from '../hooks/useSubscription';
import SubscriptionService from '../services/subscriptionService';

const MyOutfitsScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const {outfits, loading, deleteOutfit, refreshOutfits} = useOutfits();
  const {isSubscribed, canCreateOutfit, refreshSubscriptionStatus} = useSubscription();
  
  // State for outfit viewer
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [showOutfitViewer, setShowOutfitViewer] = useState(false);

  // Refreshes the outfit list and subscription status every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshOutfits();
      refreshSubscriptionStatus();
    }, [refreshOutfits, refreshSubscriptionStatus]),
  );

  const handleAddNewOutfit = async () => {
    // Check if user can create more outfits
    // Use the current outfit count directly from the outfits array
    const currentOutfitCount = outfits.length;
    const permissionResult = await canCreateOutfit(currentOutfitCount);

    if (!permissionResult.canCreate) {
      // Show paywall if user has reached the limit
      navigation.navigate('Paywall', {
        outfitCount: currentOutfitCount,
        remaining: permissionResult.remaining,
        limit: permissionResult.limit,
      });
      return;
    }

    navigation.navigate('Outfit Builder');
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteOutfit(id);
            // Refresh the outfits to ensure the count is updated
            await refreshOutfits();
          }
        },
      ],
    );
  };

  const handleViewOutfit = (outfit) => {
    setSelectedOutfit(outfit);
    setShowOutfitViewer(true);
  };

  const handleCloseOutfitViewer = () => {
    setShowOutfitViewer(false);
    setSelectedOutfit(null);
  };

  const handleDeleteFromViewer = async (outfit) => {
    await deleteOutfit(outfit.id);
    await refreshOutfits();
    handleCloseOutfitViewer();
  };

  const renderSubscriptionStatus = () => {
    const currentOutfitCount = outfits.length;
    const freeLimit = SubscriptionService.getFreeOutfitLimit();
    const remaining = Math.max(0, freeLimit - currentOutfitCount);

    if (isSubscribed) {
      return (
        <View style={styles.subscriptionStatus}>
          <View style={styles.premiumBadge}>
            <Icon name="diamond" size={16} color="white" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
          <Text style={styles.subscriptionText}>Unlimited outfits available</Text>
        </View>
      );
    }

    return (
      <View style={styles.subscriptionStatus}>
        <Text style={styles.subscriptionTitle}>Free Plan</Text>
        <Text style={styles.subscriptionText}>
          {remaining > 0
            ? `${remaining} free outfit${remaining === 1 ? '' : 's'} remaining`
            : 'Upgrade to create more outfits'
          }
        </Text>
        {remaining === 0 && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Paywall', {
              outfitCount: currentOutfitCount,
              remaining,
              limit: freeLimit,
            })}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <FlatList
        data={outfits}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <OutfitCard 
            outfit={item} 
            onDelete={() => handleDelete(item.id)}
            onPress={() => handleViewOutfit(item)}
          />
        )}
        ListHeaderComponent={renderSubscriptionStatus}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="albums-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No outfits saved yet.</Text>
            <Text style={styles.emptySubText}>
              Tap the '+' button to create your first outfit!
            </Text>
          </View>
        }
        contentContainerStyle={outfits.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={handleAddNewOutfit}>
        <Icon name="add" size={30} color={COLORS.textOnPrimary} />
      </TouchableOpacity>

      {/* Outfit Viewer Modal */}
      <OutfitViewer
        visible={showOutfitViewer}
        onClose={handleCloseOutfitViewer}
        outfit={selectedOutfit}
        onDelete={handleDeleteFromViewer}
        showActions={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80, // Space for FAB
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 30,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  subscriptionStatus: {
    backgroundColor: COLORS.card,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  premiumText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MyOutfitsScreen;
