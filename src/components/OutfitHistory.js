import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

const OutfitHistory = ({ history, onViewOutfit, onClearHistory }) => {
  if (!history || history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="shirt-outline" size={48} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No Try-Ons Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your virtual try-on history will appear here
        </Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return COLORS.success;
    if (confidence >= 0.7) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Try-Ons</Text>
        <TouchableOpacity style={styles.clearButton} onPress={onClearHistory}>
          <Icon name="trash-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {history.map((item, index) => (
          <TouchableOpacity
            key={item.id || index}
            style={styles.historyItem}
            onPress={() => onViewOutfit(item)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.resultImage || item.uri }} 
                style={styles.historyImage} 
                resizeMode="cover"
              />
              
              {/* Confidence Badge */}
              {item.confidence && (
                <View style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(item.confidence) }
                ]}>
                  <Text style={styles.confidenceText}>
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              )}

              {/* AI Badge */}
              <View style={styles.aiBadge}>
                <Icon name="sparkles" size={12} color={COLORS.textOnPrimary} />
              </View>

              {/* View Overlay */}
              <View style={styles.viewOverlay}>
                <Icon name="eye-outline" size={20} color={COLORS.textOnDark} />
              </View>
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemDate}>
                {formatDate(item.timestamp)}
              </Text>
              <Text style={styles.itemType}>
                {item.garmentType?.replace('_', ' ').toUpperCase() || 'OUTFIT'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
  },
  clearButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 20,
  },
  historyItem: {
    marginRight: 16,
    width: 120,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundSecondary,
  },
  historyImage: {
    width: 120,
    height: 160,
    backgroundColor: COLORS.backgroundSecondary,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  itemType: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OutfitHistory;