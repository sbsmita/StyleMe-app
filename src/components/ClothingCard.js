import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants/colors';

const ClothingCard = ({item, onEdit, onDelete}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [item.imageUri]);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {!hasError && (
          <Image
            source={{uri: item.imageUri}}
            style={styles.cardImage}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
        {isLoading && !hasError && <ActivityIndicator style={StyleSheet.absoluteFill} color={COLORS.primary} />}
        {hasError && <Icon name="image-outline" size={40} color={COLORS.textSecondary} />}
      </View>
        <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.brand}</Text>
        <View style={styles.materialBadge}>
          <Text style={styles.materialText}>{item.material}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Icon name="pencil" size={22} color={COLORS.success} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Icon name="trash-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 5,
  },
    imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  materialBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  materialText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
  },
});

export default ClothingCard;
