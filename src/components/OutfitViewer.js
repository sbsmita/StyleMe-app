import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Share,
  Alert,
  FlatList,
  PanResponder,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OutfitViewer = ({ 
  visible, 
  onClose, 
  outfit, 
  onSave, 
  onDelete,
  showActions = true 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'zoom'

  if (!outfit) return null;

  // Check if this is a virtual try-on result or a created outfit
  const isVirtualTryOn = outfit.resultImage || outfit.uri;
  const isCreatedOutfit = outfit.items && outfit.items.length > 0;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my virtual try-on! Created with AI fashion technology.`,
        url: outfit.resultImage || outfit.uri,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Unable to share this outfit.');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(outfit);
    } else {
      Alert.alert('Saved!', 'Outfit saved to your collection.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete(outfit);
            onClose();
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return COLORS.success;
    if (confidence >= 0.7) return COLORS.warning;
    return COLORS.error;
  };

  const renderClothingItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.clothingItemContainer}
      onPress={() => {
        setSelectedItemIndex(index);
        setViewMode('zoom');
      }}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.clothingItemImage}
        resizeMode="cover"
      />
      <View style={styles.clothingItemInfo}>
        <Text style={styles.clothingItemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.clothingItemBrand} numberOfLines={1}>
          {item.brand}
        </Text>
        {item.material && (
          <Text style={styles.clothingItemMaterial} numberOfLines={1}>
            {item.material}
          </Text>
        )}
      </View>
      <View style={styles.zoomIndicator}>
        <Icon name="expand-outline" size={16} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderZoomedItem = () => {
    if (!isCreatedOutfit || !outfit.items[selectedItemIndex]) return null;
    
    const item = outfit.items[selectedItemIndex];
    
    return (
      <View style={styles.zoomedContainer}>
        <ScrollView
          maximumZoomScale={5}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.zoomedScrollContent}
        >
          <Image
            source={{ uri: item.imageUri }}
            style={styles.zoomedImage}
            resizeMode="contain"
          />
        </ScrollView>
        
        {/* Item Navigation */}
        <View style={styles.itemNavigation}>
          <TouchableOpacity
            style={[styles.navButton, selectedItemIndex === 0 && styles.navButtonDisabled]}
            onPress={() => setSelectedItemIndex(Math.max(0, selectedItemIndex - 1))}
            disabled={selectedItemIndex === 0}
          >
            <Icon name="chevron-back" size={24} color={selectedItemIndex === 0 ? COLORS.textSecondary : COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.itemCounter}>
            <Text style={styles.itemCounterText}>
              {selectedItemIndex + 1} of {outfit.items.length}
            </Text>
            <Text style={styles.itemCounterName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.navButton, selectedItemIndex === outfit.items.length - 1 && styles.navButtonDisabled]}
            onPress={() => setSelectedItemIndex(Math.min(outfit.items.length - 1, selectedItemIndex + 1))}
            disabled={selectedItemIndex === outfit.items.length - 1}
          >
            <Icon name="chevron-forward" size={24} color={selectedItemIndex === outfit.items.length - 1 ? COLORS.textSecondary : COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Item Details */}
        <View style={styles.zoomedItemDetails}>
          <Text style={styles.zoomedItemName}>{item.name}</Text>
          <Text style={styles.zoomedItemBrand}>{item.brand}</Text>
          {item.material && (
            <Text style={styles.zoomedItemMaterial}>Material: {item.material}</Text>
          )}
          {item.color && (
            <Text style={styles.zoomedItemColor}>Color: {item.color}</Text>
          )}
          {item.size && (
            <Text style={styles.zoomedItemSize}>Size: {item.size}</Text>
          )}
        </View>

        {/* Back to Grid Button */}
        <TouchableOpacity
          style={styles.backToGridButton}
          onPress={() => setViewMode('grid')}
        >
          <Icon name="grid-outline" size={20} color={COLORS.primary} />
          <Text style={styles.backToGridText}>Back to Grid</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textOnDark} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {isVirtualTryOn ? 'Virtual Try-On' : isCreatedOutfit ? 'Outfit Details' : 'Outfit'}
          </Text>
          
          <TouchableOpacity 
            style={styles.detailsButton} 
            onPress={() => setShowDetails(!showDetails)}
          >
            <Icon 
              name={showDetails ? "information-circle" : "information-circle-outline"} 
              size={24} 
              color={COLORS.textOnDark} 
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {isVirtualTryOn ? (
            // Virtual Try-On Result View
            <View style={styles.imageContainer}>
              <ScrollView
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: outfit.resultImage || outfit.uri }}
                  style={styles.mainImage}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  resizeMode="contain"
                />
              </ScrollView>
              
              {/* Loading Overlay */}
              {imageLoading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingContainer}>
                    <Icon name="image-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                </View>
              )}

              {/* AI Badge */}
              <View style={styles.aiBadge}>
                <Icon name="sparkles" size={16} color={COLORS.textOnPrimary} />
                <Text style={styles.aiBadgeText}>AI Generated</Text>
              </View>

              {/* Confidence Badge */}
              {outfit.confidence && (
                <View style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(outfit.confidence) }
                ]}>
                  <Icon name="checkmark-circle" size={16} color={COLORS.textOnPrimary} />
                  <Text style={styles.confidenceBadgeText}>
                    {Math.round(outfit.confidence * 100)}% match
                  </Text>
                </View>
              )}
            </View>
          ) : isCreatedOutfit ? (
            // Created Outfit View
            <View style={styles.outfitContainer}>
              {viewMode === 'grid' ? (
                <View style={styles.gridContainer}>
                  <View style={styles.outfitHeader}>
                    <Text style={styles.outfitTitle}>{outfit.name}</Text>
                    <Text style={styles.outfitItemCount}>
                      {outfit.items.length} item{outfit.items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <FlatList
                    data={outfit.items}
                    renderItem={renderClothingItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.gridContent}
                  />
                  
                  <View style={styles.gridHint}>
                    <Icon name="expand-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.gridHintText}>Tap any item to zoom and view details</Text>
                  </View>
                </View>
              ) : (
                renderZoomedItem()
              )}
            </View>
          ) : (
            // Fallback for unknown outfit type
            <View style={styles.fallbackContainer}>
              <Icon name="shirt-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.fallbackText}>No outfit data available</Text>
            </View>
          )}
        </View>

        {/* Details Panel */}
        {showDetails && (
          <View style={styles.detailsPanel}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>Outfit Details</Text>
                
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={20} color={COLORS.primary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(outfit.timestamp)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="shirt-outline" size={20} color={COLORS.primary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Garment Type</Text>
                    <Text style={styles.detailValue}>
                      {outfit.garmentType?.replace('_', ' ').toUpperCase() || 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="cpu-outline" size={20} color={COLORS.primary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>AI Provider</Text>
                    <Text style={styles.detailValue}>
                      {outfit.provider || 'Fashn.ai'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="code-outline" size={20} color={COLORS.primary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Model</Text>
                    <Text style={styles.detailValue}>
                      {outfit.model || 'Product-to-Model'}
                    </Text>
                  </View>
                </View>

                {outfit.processingTime && (
                  <View style={styles.detailRow}>
                    <Icon name="time-outline" size={20} color={COLORS.primary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Processing Time</Text>
                      <Text style={styles.detailValue}>
                        {Math.round(outfit.processingTime / 1000)}s
                      </Text>
                    </View>
                  </View>
                )}

                {/* Original Images */}
                {(outfit.userImage || outfit.garmentImage) && (
                  <View style={styles.originalImagesContainer}>
                    <Text style={styles.originalImagesTitle}>Original Images</Text>
                    <View style={styles.originalImagesRow}>
                      {outfit.userImage && (
                        <View style={styles.originalImageContainer}>
                          <Image 
                            source={{ uri: outfit.userImage }} 
                            style={styles.originalImage} 
                          />
                          <Text style={styles.originalImageLabel}>You</Text>
                        </View>
                      )}
                      {outfit.garmentImage && (
                        <View style={styles.originalImageContainer}>
                          <Image 
                            source={{ uri: outfit.garmentImage }} 
                            style={styles.originalImage} 
                          />
                          <Text style={styles.originalImageLabel}>Garment</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Icon name="heart-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Icon name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textOnDark,
  },
  detailsButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    position: 'relative',
  },
  outfitContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContainer: {
    flex: 1,
    padding: 20,
  },
  outfitHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  outfitTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  outfitItemCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  gridContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clothingItemContainer: {
    width: (screenWidth - 60) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  clothingItemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
  },
  clothingItemInfo: {
    marginTop: 8,
  },
  clothingItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  clothingItemBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  clothingItemMaterial: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
  gridHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  gridHintText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  zoomedContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  zoomedScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: screenWidth,
    height: screenHeight * 0.5,
  },
  itemNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  itemCounter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  itemCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  itemCounterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  zoomedItemDetails: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  zoomedItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  zoomedItemBrand: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  zoomedItemMaterial: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  zoomedItemColor: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  zoomedItemSize: {
    fontSize: 14,
    color: COLORS.text,
  },
  backToGridButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  backToGridText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  fallbackText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  mainImage: {
    width: screenWidth,
    height: screenHeight * 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  aiBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  detailsPanel: {
    backgroundColor: COLORS.surface,
    maxHeight: screenHeight * 0.4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  originalImagesContainer: {
    marginTop: 20,
  },
  originalImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  originalImagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  originalImageContainer: {
    alignItems: 'center',
  },
  originalImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
  },
  originalImageLabel: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default OutfitViewer;