import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity} from 'react-native';
import {COLORS} from '../constants/colors';
import StarRating from './StarRating';
import Icon from 'react-native-vector-icons/Ionicons';

const OutfitCard = ({outfit, onDelete, onPress}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.outfitName}>{outfit.name}</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={outfit.rating} size={20} disabled />
          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the card press
                onDelete();
              }}
              style={styles.deleteButton}
            >
              <Icon name="trash-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
        scrollEnabled={false} // Disable scroll to prevent conflicts with card press
      >
        {outfit.items.length > 0 ? (
          outfit.items.map(item => (
            <Image
              key={item.id}
              source={{uri: item.imageUri}}
              style={styles.itemImage}
            />
          ))
        ) : (
          <Text style={styles.noItemsText}>No items in this outfit yet.</Text>
        )}
      </ScrollView>

      {/* View Button */}
      {outfit.items.length > 0 && (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: COLORS.background,
  },
  noItemsText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  viewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary, // Deep Navy Blue to match app theme
    borderRadius: 20,
    alignSelf: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  viewButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default OutfitCard;
