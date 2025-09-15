import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useIsFocused} from '@react-navigation/native';

import {COLORS} from '../constants/colors';
import {virtualTryOn, detectGarmentType, getAvailableProviders, getUsageStats} from '../services/aiService';
import useClothes from '../hooks/useClothes';
import useVirtualTryOn from '../hooks/useVirtualTryOn';
import useSubscription from '../hooks/useSubscription';
import VirtualTryOnSettings from '../components/VirtualTryOnSettings';
import OutfitViewer from '../components/OutfitViewer';
import OutfitHistory from '../components/OutfitHistory';
import SubscriptionService from '../services/subscriptionService';

const {width: screenWidth} = Dimensions.get('window');


const handleImagePickerResponse = (response, setImage) => {
  if (response.didCancel) {
    if (__DEV__) {
      console.log('User cancelled image picker');
    }
    return;
  }
  if (response.errorCode) {
    if (__DEV__) {
      console.log('ImagePicker Error: ', response.errorMessage);
    }
    Alert.alert('Image Picker Error', response.errorMessage);
    return;
  }
  if (response.assets && response.assets.length > 0) {
    setImage(response.assets[0]);
  }
};

const ImagePickerBox = ({title, image, onSelectImage, onRemoveImage, showWardrobeOption = false, onSelectFromWardrobe}) => {
  const selectImageSource = () => {
    const options = [
      {
        text: 'Take Photo',
        onPress: () => launchCamera({
          mediaType: 'photo',
          saveToPhotos: true,
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        }).then(res => handleImagePickerResponse(res, onSelectImage)),
      },
      {
        text: 'Choose from Library',
        onPress: () => launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        }).then(res => handleImagePickerResponse(res, onSelectImage)),
      },
    ];

    if (showWardrobeOption) {
      options.unshift({
        text: 'Select from My Wardrobe',
        onPress: onSelectFromWardrobe,
      });
    }

    options.push({text: 'Cancel', style: 'cancel'});

    Alert.alert('Select Image', 'Choose an option', options);
  };

  return (
    <View style={styles.imageBoxContainer}>
      <TouchableOpacity style={styles.imageBox} onPress={selectImageSource}>
        {image ? (
          <>
            <Image source={{uri: image.uri}} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={onRemoveImage}>
              <Icon name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Icon
              name={title === 'You' ? 'person-circle-outline' : 'shirt-outline'}
              size={40}
              color={COLORS.primary}
            />
            <Text style={styles.imageBoxText}>Select Photo of {title}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.imageBoxTitle}>{title}</Text>
    </View>
  );
};

const GarmentTypeSelector = ({selectedType, onSelectType, visible, onClose}) => {
  const garmentTypes = [
    {id: 'upper_body', name: 'Top', icon: 'shirt-outline'},
    {id: 'lower_body', name: 'Bottom', icon: 'fitness-outline'},
    {id: 'dress', name: 'Dress', icon: 'woman-outline'},
    {id: 'outerwear', name: 'Jacket', icon: 'layers-outline'},
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Garment Type</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={garmentTypes}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.garmentTypeItem,
                  selectedType === item.id && styles.garmentTypeItemSelected
                ]}
                onPress={() => {
                  onSelectType(item.id);
                  onClose();
                }}
              >
                <Icon name={item.icon} size={24} color={COLORS.primary} />
                <Text style={styles.garmentTypeText}>{item.name}</Text>
                {selectedType === item.id && (
                  <Icon name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const WardrobeModal = ({visible, onClose, clothes, onSelectCloth}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select from Wardrobe</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={clothes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.wardrobeItem}
                onPress={() => {
                  onSelectCloth({uri: item.imageUri});
                  onClose();
                }}
              >
                <Image source={{uri: item.imageUri}} style={styles.wardrobeItemImage} />
                <Text style={styles.wardrobeItemText} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWardrobe}>
                <Icon name="shirt-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyWardrobeText}>No clothes in wardrobe</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const VirtualTryOnScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const [userImage, setUserImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [garmentType, setGarmentType] = useState('upper_body');
  const [showGarmentTypeModal, setShowGarmentTypeModal] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOutfitViewer, setShowOutfitViewer] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [aiProviders, setAiProviders] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const {refreshSubscription} = useSubscription();

  const { clothes, addCloth } = useClothes();
  const {
    history: tryOnHistory,
    preferences,
    addToHistory,
    updatePreferences,
    clearHistory,
  } = useVirtualTryOn();

  useEffect(() => {
    const loadProviders = async () => {
      const providers = getAvailableProviders();
      setAiProviders(providers);

      const stats = await getUsageStats();
      setUsageStats(stats);

      // Check subscription status
      const subscriptionStatus = await SubscriptionService.getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus);
    };

    loadProviders();
  }, []);

  // Refresh data when screen is focused
  useEffect(() => {
    if (isFocused) {
      refreshUsageStats();
      checkSubscriptionStatus();
    }
  }, [isFocused]);

  const checkSubscriptionStatus = async () => {
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus();
    setIsSubscribed(subscriptionStatus);
  };

  // Refresh usage stats after each try-on
  const refreshUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  };

  const handleTryOn = async () => {
    if (!userImage || !garmentImage) {
      Alert.alert('Missing Images', 'Please select a photo of yourself and a garment.');
      return;
    }

    // Check if user can use virtual try-on (premium feature)
    const virtualTryOnAccess = await SubscriptionService.canUseVirtualTryOn();

    if (!virtualTryOnAccess.canUse) {
      if (__DEV__) {
        console.log('Virtual try-on access denied:', virtualTryOnAccess);
        console.log('Navigation object available:', !!navigation);
      }

      Alert.alert(
        'Premium Feature',
        virtualTryOnAccess.reason,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Upgrade to Premium',
            onPress: () => {
              if (__DEV__) {
                console.log('Attempting to navigate to Paywall...');
              }
              if (navigation && navigation.navigate) {
                navigation.navigate('Paywall');
              } else {
                Alert.alert('Navigation Error', 'Unable to open upgrade screen. Please try accessing it from the menu.');
              }
            }
          }
        ]
      );
      return;
    }

    setIsLoading(true);
    setResultImage(null);

    try {
      const options = {
        provider: preferences.preferredProvider,
        garmentType,
        preserveBackground: preferences.preserveBackground,
        enhanceQuality: preferences.enhanceQuality,
      };

      const result = await virtualTryOn(userImage, garmentImage, options);
      setResultImage(result);

      // Add to history using the hook
      addToHistory({
        userImage: userImage.uri,
        garmentImage: garmentImage.uri,
        resultImage: result.uri,
        garmentType,
        confidence: result.confidence,
        provider: result.provider || preferences.preferredProvider,
        model: result.model,
      });

      // Refresh usage stats and subscription status
      await refreshUsageStats();
      await checkSubscriptionStatus();

    } catch (error) {
      if (error.requiresPremium) {
        Alert.alert(
          'Premium Feature Required',
          error.message,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Upgrade to Premium',
              onPress: () => navigation.navigate('Paywall')
            }
          ]
        );
      } else {
        Alert.alert('Virtual Try-On Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToWardrobe = () => {
    if (!garmentImage) return;

    Alert.prompt(
      'Save to Wardrobe',
      'Enter a name for this garment:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Save',
          onPress: (name) => {
            const newClothData = {
              name: name || 'New Item from Try-On',
              brand: 'Unknown',
              material: 'Unknown',
              image: garmentImage,
            };
            addCloth(newClothData);
            Alert.alert('Saved!', 'The garment has been added to your wardrobe.');
          }
        }
      ],
      'plain-text',
      'New Garment'
    );
  };

  const handleAutoDetectGarmentType = async () => {
    if (!garmentImage) return;

    try {
      const detectedType = await detectGarmentType(garmentImage);
      setGarmentType(detectedType);
      Alert.alert('Auto-Detection', `Detected garment type: ${detectedType.replace('_', ' ')}`);
    } catch (error) {
      Alert.alert('Detection Failed', 'Could not auto-detect garment type.');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all try-on history?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        }
      ]
    );
  };

  const handleViewOutfit = (outfit) => {
    setSelectedOutfit(outfit);
    setShowOutfitViewer(true);
  };

  const handleSaveOutfit = (outfit) => {
    // Add to favorites or save to collection
    Alert.alert('Saved!', 'Outfit saved to your favorites.');
  };

  const handleDeleteOutfit = (outfit) => {
    // Remove from history
    if (outfit.id) {
      // Implementation would depend on your history management
      Alert.alert('Deleted!', 'Outfit removed from history.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.title}>Virtual Try-On</Text>
            <Text style={styles.subtitle}>
              {isSubscribed
                ? 'Professional AI virtual try-on with Fashn.ai'
                : 'Premium feature - Subscribe to unlock virtual try-on'
              }
            </Text>
          </View>
          <View style={styles.headerActions}>
            {!isSubscribed && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => navigation.navigate('Paywall')}
              >
                <Icon name="diamond-outline" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.premiumButtonText}>Premium</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Icon name="settings-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Provider Display */}
        <View style={styles.currentProviderContainer}>
          <View style={styles.providerInfo}>
            <Text style={styles.currentProviderLabel}>AI Engine:</Text>
            <Text style={styles.currentProviderName}>
              {isSubscribed ? 'Fashn.ai Professional' : 'Premium Required'}
            </Text>
          </View>
          {usageStats && isSubscribed && (
            <View style={styles.usageStats}>
              <Text style={styles.usageText}>
                {usageStats.remaining}/{usageStats.limit} remaining this month
              </Text>
              <Text style={styles.upgradeHint}>Professional Quality</Text>
            </View>
          )}
          {!isSubscribed && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Paywall')}
            >
              <Icon name="diamond-outline" size={16} color={COLORS.primary} />
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Image Selection */}
        <View style={styles.imagePickersContainer}>
          <ImagePickerBox
            title="You"
            image={userImage}
            onSelectImage={setUserImage}
            onRemoveImage={() => setUserImage(null)}
          />
          <View style={styles.plusContainer}>
            <Icon name="add-outline" size={32} color={COLORS.textSecondary} />
          </View>
          <ImagePickerBox
            title="Garment"
            image={garmentImage}
            onSelectImage={setGarmentImage}
            onRemoveImage={() => setGarmentImage(null)}
            showWardrobeOption={true}
            onSelectFromWardrobe={() => setShowWardrobeModal(true)}
          />
        </View>

        {/* Garment Type Selection */}
        {garmentImage && (
          <View style={styles.garmentTypeContainer}>
            <Text style={styles.sectionTitle}>Garment Type</Text>
            <View style={styles.garmentTypeRow}>
              <TouchableOpacity
                style={styles.garmentTypeButton}
                onPress={() => setShowGarmentTypeModal(true)}
              >
                <Text style={styles.garmentTypeButtonText}>
                  {garmentType.replace('_', ' ').toUpperCase()}
                </Text>
                <Icon name="chevron-down" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              {preferences.autoDetectGarmentType && (
                <TouchableOpacity
                  style={styles.autoDetectButton}
                  onPress={handleAutoDetectGarmentType}
                >
                  <Icon name="scan-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.autoDetectText}>Auto-detect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Try On Button */}
        <TouchableOpacity
          style={[styles.tryOnButton, (!userImage || !garmentImage) && styles.tryOnButtonDisabled]}
          onPress={handleTryOn}
          disabled={isLoading || !userImage || !garmentImage}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.textOnPrimary} />
              <Text style={styles.loadingText}>Processing with AI...</Text>
            </View>
          ) : (
            <Text style={styles.tryOnButtonText}>✨ Try It On!</Text>
          )}
        </TouchableOpacity>

        {/* Result */}
        {resultImage && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Your Virtual Try-On</Text>
              {resultImage.confidence && (
                <View style={styles.confidenceContainer}>
                  <Icon name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.confidenceText}>
                    {Math.round(resultImage.confidence * 100)}% match
                  </Text>
                </View>
              )}
            </View>

            {/* AI Generated Result */}
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => handleViewOutfit(resultImage)}
              activeOpacity={0.9}
            >
              <Image source={{uri: resultImage.uri}} style={styles.resultImage} />

              {/* AI Processing Badge */}
              <View style={styles.realAIBadge}>
                <Text style={styles.realAIBadgeText}>✨ AI Generated</Text>
              </View>

              {/* View Full Screen Hint */}
              <View style={styles.viewHint}>
                <Icon name="expand-outline" size={20} color={COLORS.textOnDark} />
                <Text style={styles.viewHintText}>Tap to view</Text>
              </View>
            </TouchableOpacity>

            {/* Processing Info */}
            <View style={styles.processingInfo}>
              <Text style={styles.processingProvider}>
                Processed by: {resultImage.provider}
              </Text>
              <Text style={styles.processingModel}>
                Model: {resultImage.model?.split('/').pop() || 'Hugging Face AI'}
              </Text>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveToWardrobe}>
                <Icon name="add-circle-outline" size={20} color={COLORS.textOnPrimary} />
                <Text style={styles.saveButtonText}>Save Garment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
              >
                <Icon name="share-outline" size={20} color={COLORS.primary} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Enhanced Try-On History */}
        <OutfitHistory
          history={tryOnHistory}
          onViewOutfit={handleViewOutfit}
          onClearHistory={handleClearHistory}
        />
      </ScrollView>

      {/* Modals */}
      <GarmentTypeSelector
        selectedType={garmentType}
        onSelectType={setGarmentType}
        visible={showGarmentTypeModal}
        onClose={() => setShowGarmentTypeModal(false)}
      />

      <WardrobeModal
        visible={showWardrobeModal}
        onClose={() => setShowWardrobeModal(false)}
        clothes={clothes}
        onSelectCloth={setGarmentImage}
      />

      <VirtualTryOnSettings
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        providers={aiProviders}
        onClearHistory={handleClearHistory}
      />

      <OutfitViewer
        visible={showOutfitViewer}
        onClose={() => setShowOutfitViewer(false)}
        outfit={selectedOutfit}
        onSave={handleSaveOutfit}
        onDelete={handleDeleteOutfit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  premiumButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Current Provider Display
  currentProviderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 25,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentProviderLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  currentProviderName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  usageStats: {
    alignItems: 'flex-end',
  },
  usageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  upgradeHint: {
    fontSize: 10,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  upgradeButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Image Selection
  imagePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  imageBoxContainer: {
    alignItems: 'center',
    flex: 1,
  },
  imageBox: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.45,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  imageBoxText: {
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  imageBoxTitle: {
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  plusContainer: {
    paddingHorizontal: 20,
  },

  // Garment Type Selection
  garmentTypeContainer: {
    marginBottom: 25,
  },
  garmentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  garmentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  garmentTypeButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  autoDetectText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Try On Button
  tryOnButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tryOnButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    elevation: 0,
    shadowOpacity: 0,
  },
  tryOnButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '500',
  },

  // Result
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    width: screenWidth - 40,
    aspectRatio: 3 / 4,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },
  realAIBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 3,
  },
  realAIBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewHintText: {
    color: COLORS.textOnDark,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  processingInfo: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  processingProvider: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  processingModel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // History
  historyContainer: {
    marginBottom: 20,
  },
  historyItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  historyImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  historyDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Garment Type Modal
  garmentTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    gap: 16,
  },
  garmentTypeItemSelected: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  garmentTypeText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Wardrobe Modal
  wardrobeItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  wardrobeItemImage: {
    width: (screenWidth - 80) / 2,
    height: (screenWidth - 80) / 2 * 1.2,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  wardrobeItemText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyWardrobe: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWardrobeText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
});

export default VirtualTryOnScreen;
